import "server-only";
import type { Appointment, AppointmentStatus } from "@/types/admin/appointment";
import type { Patient, PatientGender } from "@/types/admin/patient";
import type { Todo } from "@/types/admin/todo";

// Database rows to the shapes the admin pages use. Empty columns become missing fields.

const iso = (value: Date | string) => new Date(value).toISOString();
const optional = <T,>(value: T | null) => value ?? undefined;

export type PatientRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: PatientGender | null;
  profession: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
};

export const toPatient = (row: PatientRow): Patient => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: optional(row.email),
  age: optional(row.age),
  gender: optional(row.gender),
  profession: optional(row.profession),
  address: optional(row.address),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

export type AppointmentRow = {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  service: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export const toAppointment = (row: AppointmentRow): Appointment => ({
  id: row.id,
  patientId: row.patient_id,
  date: row.date,
  time: row.time,
  service: row.service,
  status: row.status,
  notes: optional(row.notes),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

export type TodoRow = { id: string; label: string; done: boolean; date: string };

export const toTodo = (row: TodoRow): Todo => ({ id: row.id, label: row.label, done: row.done, date: row.date });
