import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    const inventoryId = body.inventoryId;
    const quantity = Number(body.quantity);

    console.log("BODY:", body);

    const inventory =
      await prisma.inventory.findUnique({
        where: {
          id: inventoryId,
        },
      });

    console.log("INVENTORY:", inventory);

    if (!inventory) {

      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    const availableStock =
      inventory.totalStock -
      inventory.reservedStock;

    if (availableStock < quantity) {

      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 409 }
      );
    }

    await prisma.inventory.update({
      where: {
        id: inventoryId,
      },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });

    const reservation =
      await prisma.reservation.create({
        data: {
          inventoryId,
          quantity,
          expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
          ),
        },
      });

    console.log("RESERVATION:", reservation);
    return NextResponse.json(reservation);

  } catch (error) {

    console.error("POST ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}