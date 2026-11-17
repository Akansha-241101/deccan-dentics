import type { WeeklyHours } from "@/features/appointment/types/slots";

// Deccan Dentics' default clinic hours, India time. An empty day is closed.
// Same as the website footer (Mon–Sat 9 AM – 8 PM, Sun 2 PM – 6 PM). They are the starting rows
// of dd_schedule_slots; the app reads the database at run time.
const WEEKDAY_WINDOWS = [{ start: "09:00", end: "20:00" }];

export const CLINIC_AVAILABLE_TIMES: WeeklyHours = {
  monday: WEEKDAY_WINDOWS,
  tuesday: WEEKDAY_WINDOWS,
  wednesday: WEEKDAY_WINDOWS,
  thursday: WEEKDAY_WINDOWS,
  friday: WEEKDAY_WINDOWS,
  saturday: WEEKDAY_WINDOWS,
  sunday: [{ start: "14:00", end: "18:00" }],
};
