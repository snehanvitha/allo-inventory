import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { prisma } = await import("@/lib/prisma");

    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {

      const reservation = await tx.reservation.findUnique({
        where: {
          id,
        },
      });

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      const updatedReservation =
        await tx.reservation.update({
          where: {
            id,
          },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });

      return updatedReservation;
    });

    return NextResponse.json(result);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to confirm reservation" },
      { status: 500 }
    );
  }
}