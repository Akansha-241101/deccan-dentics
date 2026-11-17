import type { BookingSettings } from "@/features/appointment/types/slots";

// Fixed facts about the business. These never change from the admin.
export const APPOINTMENT_SETTINGS = {
  timezone: "Asia/Kolkata",
  utcOffset: "+05:30",
  utcOffsetMinutes: 330,
  currency: "INR",
} as const;

// The clinic's booking rules. They are the starting row of dd_settings, which the app reads at
// run time. These values are the fallback before the admin data loads and the shape of the row.
const visitMinutes = 30;
const prepMinutes = 15;
export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  visitMinutes,
  prepMinutes,
  blockMinutes: visitMinutes + prepMinutes,
  startStepMinutes: 15,
  bookingDaysAhead: 30,
};

// The starting services, seeded into dd_services: the six treatments on the home page
// (src/data/services.ts). The app reads dd_services, so the booking dropdown and the admin always
// show what the database holds.
export const DEFAULT_SERVICES = [
  "Dental Implants",
  "Cosmetic Dentistry",
  "Root Canals",
  "Teeth Whitening",
  "Dental Crowns",
  "Kids Dentistry",
];
