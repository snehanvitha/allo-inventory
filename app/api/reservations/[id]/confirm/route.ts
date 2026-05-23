import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id: reservationId } = await params;

    const result =
      await prisma.$transaction(async (tx) => {

        const reservation =
          await tx.reservation.findUnique({
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

        if (
          reservation.status !== "PENDING" ||
          reservation.expiresAt < new Date()
        ) {

          await tx.reservation.update({
            where: {
              id: reservation.id,
            },
            data: {
              status: "EXPIRED",
            },
          });

          return {
            error: "Reservation expired",
            status: 410,
          };
        }

        const confirmedReservation =
          await tx.reservation.update({
            where: {
              id: reservation.id,
            },
            data: {
              status: "CONFIRMED",
              confirmedAt: new Date(),
            },
          });

        return confirmedReservation;
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
      { error: "Failed to confirm reservation" },
      { status: 500 }
    );
  }
}