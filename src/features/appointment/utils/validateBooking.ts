import type { BookingInput } from "@/features/appointment/types/booking";
import type { PatientGender } from "@/types/admin/patient";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[6-9]\d{9}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const GENDERS: PatientGender[] = ["Female", "Male"];

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function parseAge(value: unknown): number | null {
  const raw = typeof value === "number" ? value : Number(text(value));
  if (!Number.isInteger(raw) || raw < 1 || raw > 120) return null;
  return raw;
}

// Returns a clean booking, or an error message for the customer. `services` is dd_services.
export function validateBooking(body: Record<string, unknown>, services: string[]): BookingInput | string {
  const gender = text(body.gender) as PatientGender;
  const age = parseAge(body.age);
  const input: BookingInput = {
    name: text(body.name),
    email: text(body.email).toLowerCase(),
    phone: text(body.phone).replace(/\D/g, "").slice(-10),
    age: age ?? 0,
    gender,
    service: text(body.service),
    date: text(body.date),
    time: text(body.time),
  };
  if (!services.includes(input.service)) return "Please select a service.";
  if (input.name.length < 2 || input.name.length > 80) return "Please enter your full name.";
  if (!EMAIL.test(input.email)) return "Please enter a valid email address.";
  if (age === null) return "Please enter a valid age between 1 and 120.";
  if (!GENDERS.includes(input.gender)) return "Please select a gender.";
  if (!PHONE.test(input.phone)) return "Please enter a valid 10-digit mobile number.";
  if (!DATE.test(input.date) || !TIME.test(input.time)) return "Select an available date and time to continue.";
  return input;
}
