"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reservation {
  id: string;
  inventoryId: string;
  quantity: number;
  status: string;
  expiresAt: string;
  confirmedAt: string | null;
  releasedAt: string | null;
}

export default function ReservationPage() {

  const params = useParams();
  const router = useRouter();

  const reservationId = params.id as string;

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeRemaining, setTimeRemaining] =
    useState("");

  useEffect(() => {

    fetchReservation();

  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry = new Date(
        reservation.expiresAt
      ).getTime();

      const difference = expiry - now;

      if (difference <= 0) {

        setTimeRemaining("Expired");

        clearInterval(interval);

        return;
      }

      const minutes =
        Math.floor(
          (difference % (1000 * 60 * 60)) /
          (1000 * 60)
        );

      const seconds =
        Math.floor(
          (difference % (1000 * 60)) / 1000
        );

      setTimeRemaining(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  async function fetchReservation() {

    try {

      const response =
        await axios.get(
          `/api/reservations/${reservationId}`
        );

      console.log(response.data);

      setReservation(response.data);

    } catch (error: any) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Failed to fetch reservation"
      );
    }
  }

  async function confirmReservation() {

    try {

      await axios.post(
        `/api/reservations/${reservationId}/confirm`
      );

      alert("Reservation confirmed");

      fetchReservation();

    } catch (error: any) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Failed to confirm reservation"
      );
    }
  }

  async function releaseReservation() {

    try {

      await axios.post(
        `/api/reservations/${reservationId}/release`
      );

      alert("Reservation cancelled");

      fetchReservation();

      router.push("/");

    } catch (error: any) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Failed to cancel reservation"
      );
    }
  }

  if (!reservation) {

    return (
      <div className="p-10 text-white">
        Loading reservation...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        Reservation Details
      </h1>

      <div className="
        border
        border-gray-700
        rounded-2xl
        p-8
        max-w-3xl
      ">

        <p className="text-3xl mb-6">
          <span className="font-bold">
            Reservation ID:
          </span>{" "}
          {reservation.id}
        </p>

        <p className="text-2xl mb-4">
          <span className="font-bold">
            Status:
          </span>{" "}
          {reservation.status}
        </p>

        <p className="text-2xl mb-4">
          <span className="font-bold">
            Quantity:
          </span>{" "}
          {reservation.quantity}
        </p>

        {reservation.status === "PENDING" && (
          <p className="text-2xl mb-6">
            <span className="font-bold">
              Time Remaining:
            </span>{" "}
            {timeRemaining}
          </p>
        )}

        {reservation.status === "PENDING" && (
          <div className="flex gap-4 mt-6">

            <button
              onClick={confirmReservation}
              className="
                bg-green-500
                text-white
                px-6
                py-3
                rounded-lg
                hover:bg-green-600
              "
            >
              Confirm Purchase
            </button>

            <button
              onClick={releaseReservation}
              className="
                bg-red-500
                text-white
                px-6
                py-3
                rounded-lg
                hover:bg-red-600
              "
            >
              Cancel
            </button>

          </div>
        )}

      </div>

    </div>
  );
}