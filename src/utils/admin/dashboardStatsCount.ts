import type { Appointment, AppointmentStatus } from "@/types/admin/appointment";
import type { DashboardFilters, DashboardStatusFilter } from "@/types/admin/dashboard";
import type { Patient } from "@/types/admin/patient";
import { isInWindow, type DateWindow } from "@/utils/admin/dashboardRange";

function matchStatus(appointment: Appointment, status: DashboardStatusFilter): boolean {
  return status === "all" || appointment.status === status;
}

// Appointments booked in the window (created_at) that pass the status filter.
function booked(appointments: Appointment[], filters: DashboardFilters, window: DateWindow) {
  return appointments.filter((a) => matchStatus(a, filters.status) && isInWindow(a.createdAt, window));
}

export function countWithStatus(
  appointments: Appointment[],
  status: AppointmentStatus,
  filters: DashboardFilters,
  window: DateWindow,
) {
  return booked(appointments, filters, window).filter((a) => a.status === status).length;
}

/** Patients added in the window (created_at): website bookings and ones the admin added. */
export function countNewPatients(patients: Patient[], window: DateWindow) {
  return patients.filter((p) => isInWindow(p.createdAt, window)).length;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
