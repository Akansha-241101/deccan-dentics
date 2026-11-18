import type { DateRange } from "react-day-picker";
import type { AppointmentDateFilter } from "@/types/admin/appointment";
export type PatientGender = "Female" | "Male";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  /** Collected on website booking; the admin can edit them later. */
  age?: number;
  gender?: PatientGender;
  profession?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientInput = Omit<Patient, "id" | "createdAt" | "updatedAt">;

export type PatientAgeFilter = "all" | "under18" | "18-30" | "31-45" | "46plus";

/** List order by when the patient was added (created_at). */
export type PatientSort = "newest" | "oldest";

export type PatientListFilters = {
  query: string;
  age: PatientAgeFilter;
  /** Patients added today, this week or this month (by created_at). */
  date: AppointmentDateFilter;
  sort: PatientSort;
  /** Patients added between these days. */
  dateRange?: DateRange;
};
