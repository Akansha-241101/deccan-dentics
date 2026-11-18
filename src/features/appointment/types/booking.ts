import type { PatientGender } from "@/types/admin/patient";

/** What the booking form sends: the customer's details and the chosen slot. */
export type BookingInput = {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: PatientGender;
  service: string;
  date: string; // YYYY-MM-DD in IST
  time: string; // HH:MM in IST
};

export type BookingSlot = {
  date: string;
  time: string;
};
