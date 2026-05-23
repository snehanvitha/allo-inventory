import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validators/reservation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = reservationSchema.parse(body);

    const { inventoryId, quantity } = validatedData;

    const reservation = await prisma.$transaction(async (tx) => {

      // Fetch inventory
      const inventory = await tx.inventory.findUnique({
        where: {
          id: inventoryId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      // Prevent overselling
      if (availableStock < quantity) {
        return {
          error: "Not enough stock available",
          status: 409,
        };
      }

      // Reserve stock atomically
      await tx.inventory.update({
        where: {
          id: inventoryId,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          inventoryId,
          quantity,

          expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
          ),
        },
      });

      return reservation;
    });

    if ("error" in reservation) {
      return NextResponse.json(
        { error: reservation.error },
        { status: reservation.status }
      );
    }

    return NextResponse.json(reservation);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}