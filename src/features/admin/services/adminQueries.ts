import "server-only";
import { db } from "@/services/database";
import type { AdminSettings } from "@/types/admin/settings";
import { toAppointment, toPatient, toTodo, type AppointmentRow, type PatientRow, type TodoRow } from "@/features/admin/services/adminRows";

export async function listPatients() {
  const rows = await db()`select * from dd_patients order by updated_at desc`;
  return (rows as PatientRow[]).map(toPatient);
}

export async function listAppointments() {
  const rows = await db()`
    select id, patient_id, to_char(date, 'YYYY-MM-DD') as date, to_char(time, 'HH24:MI') as time,
      service, status, notes, created_at, updated_at
    from dd_appointments order by date desc, time desc`;
  return (rows as AppointmentRow[]).map(toAppointment);
}

export async function listTodos() {
  const rows = await db()`select id, label, done, to_char(date, 'YYYY-MM-DD') as date from dd_todos order by date desc, created_at desc`;
  return (rows as TodoRow[]).map(toTodo);
}

// Hidden start times from today on (older ones no longer matter).
export async function listHiddenSlots() {
  const rows = await db()`
    select to_char(date, 'YYYY-MM-DD') as date, to_char(time, 'HH24:MI') as time
    from dd_hidden_slots where date >= (now() at time zone 'Asia/Kolkata')::date order by date, time`;
  return rows as { date: string; time: string }[];
}

export async function getPreferences(): Promise<AdminSettings> {
  const [row] = await db()`
    select email_reminders, sms_reminders, appointment_emails, marketing_emails, desktop_notifications, weekly_digest
    from dd_settings where id`;
  return {
    emailReminders: row.email_reminders,
    smsReminders: row.sms_reminders,
    appointmentEmails: row.appointment_emails,
    marketingEmails: row.marketing_emails,
    desktopNotifications: row.desktop_notifications,
    weeklyDigest: row.weekly_digest,
  };
}
