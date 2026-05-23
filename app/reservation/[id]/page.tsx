"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Reservation {
  id: string;
  status: string;
  quantity: number;
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

  const [timeLeft, setTimeLeft] =
    useState("");

  async function fetchReservation() {

    try {

      const response =
        await axios.get(
          `/api/reservations/${reservationId}`
        );

      setReservation(response.data);
      console.log(response.data);

    } catch (error: any) {

  console.error(error);

  alert(
    error.response?.data?.error ||
    "Failed to fetch reservation"
  );
}
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry =
        new Date(
          reservation.expiresAt
        ).getTime();

      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const minutes =
        Math.floor(
          difference / 1000 / 60
        );

      const seconds =
        Math.floor(
          (difference / 1000) % 60
        );

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  async function confirmReservation() {

    try {

      await axios.post(
        `/api/reservations/${reservationId}/confirm`
      );

      alert("Purchase confirmed!");

      fetchReservation();

    } catch (error: any) {

      if (
        error.response?.status === 410
      ) {
        alert("Reservation expired");
      } else {
        alert("Failed to confirm reservation");
      }
    }
  }

  async function cancelReservation() {

    try {

      await axios.post(
        `/api/reservations/${reservationId}/release`
      );

      alert("Reservation cancelled");

      router.push("/");

    } catch (error) {
      alert("Failed to cancel reservation");
    }
  }

  if (!reservation) {
    return (
      <div className="p-10">
        Loading reservation...
      </div>
    );
  }

  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Reservation Details
      </h1>

      <div className="border rounded-xl p-6 shadow max-w-xl">

        <p>
          <strong>Reservation ID:</strong>
          {" "}
          {reservation.id}
        </p>

        <p className="mt-3">
          <strong>Status:</strong>
          {" "}
          {reservation.status}
        </p>

        <p className="mt-3">
          <strong>Quantity:</strong>
          {" "}
          {reservation.quantity}
        </p>

        <p className="mt-3">
          <strong>Time Remaining:</strong>
          {" "}
          {timeLeft}
        </p>

        <div className="flex gap-4 mt-6">

          <button
            onClick={confirmReservation}
            className="bg-green-600 text-white px-5 py-2 rounded-lg"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </main>
  );
}