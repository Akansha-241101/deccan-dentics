import type { DateRange } from "react-day-picker";

export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "not-attended"
  | "cancelled";

/** Bulk "mark as completed" changes only these. Cancelled stays cancelled: its slot may be rebooked. */
export const canBulkComplete = (status: AppointmentStatus) => status === "upcoming" || status === "not-attended";

export type Appointment = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  service: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentInput = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt"
>;

export type AppointmentDateFilter =
  | "all"
  | "today"
  | "this-week"
  | "this-month";

export type AppointmentListFilters = {
  query: string;
  status: "all" | AppointmentStatus;
  date: AppointmentDateFilter;
  sort: AppointmentSort;
  /** Appointments on days between these (replaces the date preset while set). */
  dateRange?: DateRange;
};

/** List order: last added or changed first (updated_at), or by appointment date and time. */
export type AppointmentSort = "updated" | "date-asc" | "date-desc";
