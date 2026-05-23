import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: reservationId } = await params;

    const result = await prisma.$transaction(async (tx) => {

      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

      if (!reservation) {
        return {
          error: "Reservation not found",
          status: 404,
        };
      }

      // Prevent releasing already completed reservation
      if (reservation.status !== "PENDING") {
        return {
          error: "Reservation cannot be released",
          status: 400,
        };
      }

      // Decrease reserved stock
      await tx.inventory.update({
        where: {
          id: reservation.inventoryId,
        },
        data: {
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      // Mark reservation released
      const releasedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "RELEASED",
            releasedAt: new Date(),
          },
        });

      return releasedReservation;
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to release reservation" },
      { status: 500 }
    );
  }
}