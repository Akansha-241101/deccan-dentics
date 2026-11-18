import "server-only";
import type { BookingInput } from "@/features/appointment/types/booking";
import type { OccupiedSlot } from "@/features/appointment/types/slots";
import { getBookingSettings, getWeeklyHours } from "@/features/appointment/services/bookingConfig";
import type { SlotSource } from "@/features/appointment/utils/customerSlots";
import { hasSlotConflict } from "@/features/appointment/utils/appointmentSlots";
import { addDays, todayIst } from "@/features/appointment/utils/istTime";
import { db } from "@/services/database";

const formatPhone = (phone: string) => `${phone.slice(0, 5)} ${phone.slice(5)}`;

// Slots taken from today to the end of the booking window: booked appointments (not cancelled).
async function occupiedSlots(days: number): Promise<OccupiedSlot[]> {
  const from = todayIst();
  const to = addDays(from, days);
  const rows = await db()`
    select to_char(date, 'YYYY-MM-DD') as date, to_char(time, 'HH24:MI') as time
    from dd_appointments where status <> 'cancelled' and date between ${from}::date and ${to}::date`;
  return rows as OccupiedSlot[];
}

// Everything the customer-side slot rules need, fresh from the database.
export async function slotSource(): Promise<SlotSource> {
  const [weekly, settings] = await Promise.all([getWeeklyHours(), getBookingSettings()]);
  const [occupied, hidden] = await Promise.all([occupiedSlots(settings.bookingDaysAhead), hiddenSlots()]);
  return { weekly, settings, occupied, hidden };
}

// Start times the admin hid, from today on.
async function hiddenSlots(): Promise<OccupiedSlot[]> {
  const rows = await db()`
    select to_char(date, 'YYYY-MM-DD') as date, to_char(time, 'HH24:MI') as time
    from dd_hidden_slots where date >= ${todayIst()}::date`;
  return rows as OccupiedSlot[];
}

// An existing patient with the same 10-digit phone, or a new one. Updates email/age/gender.
async function patientFor(input: BookingInput): Promise<string> {
  const sql = db();
  const [known] = await sql`
    select id from dd_patients where right(regexp_replace(phone, '\\D', '', 'g'), 10) = ${input.phone} limit 1`;
  if (known) {
    await sql`
      update dd_patients
      set email = coalesce(email, ${input.email}), age = ${input.age}, gender = ${input.gender}
      where id = ${known.id}`;
    return String(known.id);
  }
  const [created] = await sql`
    insert into dd_patients (name, phone, email, age, gender)
    values (${input.name}, ${formatPhone(input.phone)}, ${input.email}, ${input.age}, ${input.gender})
    returning id`;
  return String(created.id);
}

export type BookingOutcome = { ok: true; appointmentId: string } | { ok: false; error: string };

const SLOT_TAKEN = "This slot was just taken. Please pick another time.";

// Saves the patient and the appointment for a website booking. The insert only goes ahead when no
// other (not cancelled) appointment overlaps the slot, checked in the same statement, and the
// unique index on (date, time) stops two identical bookings landing at once.
export async function createBooking(input: BookingInput): Promise<BookingOutcome> {
  const sql = db();
  const { blockMinutes } = await getBookingSettings();
  const sameDay = await sql`
    select id, to_char(date, 'YYYY-MM-DD') as date, to_char(time, 'HH24:MI') as time, status
    from dd_appointments where date = ${input.date}::date`;
  if (hasSlotConflict(input.date, input.time, sameDay as { id: string; date: string; time: string; status: "upcoming" }[], blockMinutes)) {
    return { ok: false, error: SLOT_TAKEN };
  }

  const patientId = await patientFor(input);
  try {
    const [row] = await sql`
      insert into dd_appointments (patient_id, date, time, service, status)
      select ${patientId}, ${input.date}::date, ${input.time}::time, ${input.service}, 'upcoming'
      where not exists (
        select 1 from dd_appointments a
        where a.date = ${input.date}::date and a.status <> 'cancelled'
          and a.time < ${input.time}::time + make_interval(mins => ${blockMinutes})
          and ${input.time}::time < a.time + make_interval(mins => ${blockMinutes})
      )
      returning id`;
    return row ? { ok: true, appointmentId: String(row.id) } : { ok: false, error: SLOT_TAKEN };
  } catch (error) {
    // 23505: the unique (date, time) index caught a booking made at the same moment.
    if ((error as { code?: string }).code === "23505") return { ok: false, error: SLOT_TAKEN };
    throw error;
  }
}
