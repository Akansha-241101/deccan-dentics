import type { AppointmentInput } from "@/types/admin/appointment";

export function hasAppointmentBasics(input: AppointmentInput): boolean {
  return Boolean(
    input.patientId &&
      input.date &&
      input.time &&
      input.service.trim() &&
      input.status,
  );
}

/** Names of the booking fields still empty, for the "what's missing" hint. */
export function missingBasics(input: AppointmentInput): string[] {
  const missing: string[] = [];
  if (!input.patientId) missing.push("patient");
  if (!input.date) missing.push("date");
  if (!input.time) missing.push("time");
  if (!input.service.trim()) missing.push("service");
  return missing;
}
