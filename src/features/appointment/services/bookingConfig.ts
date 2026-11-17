import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { BookingSettings, WeeklyHours } from "@/features/appointment/types/slots";
import { WEEKDAYS } from "@/features/appointment/utils/hours";
import type { DaySchedule, Weekday } from "@/types/admin/schedule";
import { db } from "@/services/database";

// Settings, working hours and services change rarely, so they are cached.
// Every admin change to them calls updateTag(BOOKING_CONFIG_TAG), so the next read is fresh.
export const BOOKING_CONFIG_TAG = "booking-config";

type ScheduleRow = { id: string; weekday: Weekday; start: string; end: string };

export async function getBookingSettings(): Promise<BookingSettings> {
  "use cache";
  cacheTag(BOOKING_CONFIG_TAG);
  cacheLife("hours");
  const [row] = await db()`
    select visit_minutes, prep_minutes, start_step_minutes, booking_days_ahead
    from dd_settings where id`;
  return {
    visitMinutes: row.visit_minutes,
    prepMinutes: row.prep_minutes,
    blockMinutes: row.visit_minutes + row.prep_minutes,
    startStepMinutes: row.start_step_minutes,
    bookingDaysAhead: row.booking_days_ahead,
  };
}

export async function getScheduleRows(): Promise<ScheduleRow[]> {
  "use cache";
  cacheTag(BOOKING_CONFIG_TAG);
  cacheLife("hours");
  const rows = await db()`
    select id, weekday, to_char(start_time, 'HH24:MI') as start, to_char(end_time, 'HH24:MI') as end
    from dd_schedule_slots order by start_time`;
  return rows as ScheduleRow[];
}

// The working hours as the slot rules read them. A weekday with no rows is closed.
export async function getWeeklyHours(): Promise<WeeklyHours> {
  const rows = await getScheduleRows();
  return Object.fromEntries(
    WEEKDAYS.map((day) => [day, rows.filter((row) => row.weekday === day).map(({ start, end }) => ({ start, end }))]),
  ) as WeeklyHours;
}

// The same rows as the admin Schedule page edits them: one card per day, windows with ids.
export async function getScheduleDays(): Promise<DaySchedule[]> {
  const rows = await getScheduleRows();
  return WEEKDAYS.map((day) => {
    const slots = rows.filter((row) => row.weekday === day).map((row) => ({ id: row.id, openTime: row.start, closeTime: row.end }));
    return { day, isOpen: slots.length > 0, slots };
  });
}

// Services are edited straight in Neon (there is no admin page for them), so nothing calls
// updateTag after a change. A short cache life lets a change show within minutes.
export async function getServices(): Promise<string[]> {
  "use cache";
  cacheTag(BOOKING_CONFIG_TAG);
  cacheLife("minutes");
  const rows = await db()`select name from dd_services order by position, name`;
  return rows.map((row) => String(row.name));
}
