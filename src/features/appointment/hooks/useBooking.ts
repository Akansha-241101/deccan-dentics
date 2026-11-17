"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmedPath } from "@/constants/routes";
import { createBooking } from "@/features/appointment/services/bookingApi";
import type { BookingInput } from "@/features/appointment/types/booking";
import { useShowToast } from "@/hooks/useShowToast";

// Runs the booking: the server checks the slot and saves the patient and the appointment →
// confirmation page. Every outcome shows a toast; a failure also stays on screen as `error`.
export function useBooking() {
  const router = useRouter();
  const showToast = useShowToast();
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function book(input: BookingInput) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    const saving = showToast({ title: "Booking your appointment…", type: "pending" });
    const saved = await createBooking(input);
    if (!saved.ok) {
      setError(saved.error);
      showToast({ title: "Booking not completed", description: saved.error, type: "error", id: saving });
      locked.current = false;
      setBusy(false);
      return;
    }
    // The page moves on, so the form stays locked.
    showToast({ title: "Appointment booked", description: "A confirmation is on its way to your email.", type: "success", id: saving });
    router.push(confirmedPath(saved.appointmentId));
  }

  return { book, busy, error };
}
