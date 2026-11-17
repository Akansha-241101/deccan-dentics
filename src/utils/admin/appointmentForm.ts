import type {
  Appointment,
  AppointmentInput,
} from "@/types/admin/appointment";
import type { Patient } from "@/types/admin/patient";

const EMPTY: AppointmentInput = {
  patientId: "",
  date: "",
  time: "",
  service: "",
  status: "upcoming",
};

export function appointmentToInput(
  appointment: Appointment | null | undefined,
  patients: Patient[],
  defaults?: Partial<AppointmentInput>,
): AppointmentInput {
  if (appointment) {
    return {
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      status: appointment.status,
      notes: appointment.notes,
    };
  }
  const patientId = defaults?.patientId ?? patients[0]?.id ?? "";
  return { ...EMPTY, patientId, ...defaults };
}
