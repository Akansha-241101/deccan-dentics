"use server";

import { updateTag } from "next/cache";
import { listAppointments } from "@/features/admin/services/adminQueries";
import { toAppointment, toPatient, type AppointmentRow, type PatientRow } from "@/features/admin/services/adminRows";
import { BOOKING_CONFIG_TAG, getBookingSettings, getScheduleDays } from "@/features/appointment/services/bookingConfig";
import { adminSlotError } from "@/features/appointment/utils/appointmentSlots";
import { assertAdmin } from "@/features/auth/services/session";
import { db } from "@/services/database";
import type { Appointment, AppointmentInput } from "@/types/admin/appointment";
import type { Patient } from "@/types/admin/patient";
import type { DaySchedule } from "@/types/admin/schedule";
import type { AdminSettings } from "@/types/admin/settings";
import { attempt, type ActionResult } from "@/utils/actionResult";
import { weekHasProblems } from "@/utils/admin/scheduleChecks";

// Every admin change goes through here. Each action checks the session first.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function savePatientAction(patient: Patient): Promise<ActionResult<{ patient: Patient }>> {
  return attempt(async () => {
    await assertAdmin();
    const [row] = await db()`
      insert into dd_patients (id, name, phone, email, age, gender, profession, address)
      values (${patient.id}, ${patient.name}, ${patient.phone}, ${patient.email ?? null}, ${patient.age ?? null},
              ${patient.gender ?? null}, ${patient.profession ?? null}, ${patient.address ?? null})
      on conflict (id) do update set
        name = excluded.name, phone = excluded.phone, email = excluded.email, age = excluded.age,
        gender = excluded.gender, profession = excluded.profession, address = excluded.address
      returning *`;
    return { patient: toPatient(row as PatientRow) };
  }, "Could not save the patient.");
}

export async function deletePatientAction(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertAdmin();
    await db()`delete from dd_patients where id = ${id}`;
    return {};
  }, "Could not delete the patient.");
}

// Checks the booking rules against the database, not the browser's copy, then saves.
export async function saveAppointmentAction(input: AppointmentInput, id?: string): Promise<ActionResult<{ appointment: Appointment }>> {
  return attempt(async () => {
    await assertAdmin();
    const [days, settings, appointments] = await Promise.all([getScheduleDays(), getBookingSettings(), listAppointments()]);
    const original = id ? appointments.find((item) => item.id === id) : null;
    const problem = adminSlotError(input, days, appointments, settings, original);
    if (problem) throw new Error(problem);

    const [row] = await db()`
      insert into dd_appointments (id, patient_id, date, time, service, status, notes)
      values (${id ?? crypto.randomUUID()}, ${input.patientId}, ${input.date}, ${input.time}, ${input.service}, ${input.status},
              ${input.notes ?? null})
      on conflict (id) do update set
        patient_id = excluded.patient_id, date = excluded.date, time = excluded.time, service = excluded.service,
        status = excluded.status, notes = excluded.notes
      returning id, patient_id, to_char(date, 'YYYY-MM-DD') as date, to_char(time, 'HH24:MI') as time,
        service, status, notes, created_at, updated_at`;
    return { appointment: toAppointment(row as AppointmentRow) };
  }, "Could not save the appointment.");
}

export async function deleteAppointmentAction(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertAdmin();
    await db()`delete from dd_appointments where id = ${id}`;
    return {};
  }, "Could not delete the appointment.");
}

// Replaces the weekly hours with what the Schedule page shows. A week with a window that ends
// before it starts, or with overlapping windows, is refused (the page shows what to fix), so
// nothing is dropped silently. Closed days have no rows.
export async function saveScheduleAction(days: DaySchedule[]): Promise<ActionResult> {
  return attempt(async () => {
    await assertAdmin();
    if (weekHasProblems(days)) throw new Error("Some hours end before they start or overlap. Fix the highlighted times.");
    const sql = db();
    const inserts = days
      .filter((day) => day.isOpen)
      .flatMap((day) =>
        day.slots
          .map((slot) => sql`
            insert into dd_schedule_slots (id, weekday, start_time, end_time)
            values (${UUID.test(slot.id) ? slot.id : crypto.randomUUID()}, ${day.day}, ${slot.openTime}, ${slot.closeTime})`),
      );
    await sql.transaction([sql`delete from dd_schedule_slots`, ...inserts]);
    updateTag(BOOKING_CONFIG_TAG);
    return {};
  }, "Could not save the schedule.");
}

export async function savePreferencesAction(preferences: AdminSettings): Promise<ActionResult> {
  return attempt(async () => {
    await assertAdmin();
    await db()`
      update dd_settings set
        email_reminders = ${preferences.emailReminders}, sms_reminders = ${preferences.smsReminders},
        appointment_emails = ${preferences.appointmentEmails}, marketing_emails = ${preferences.marketingEmails},
        desktop_notifications = ${preferences.desktopNotifications}, weekly_digest = ${preferences.weeklyDigest}
      where id`;
    return {};
  }, "Could not save the setting.");
}
