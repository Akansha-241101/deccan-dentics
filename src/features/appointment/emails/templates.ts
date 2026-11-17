import { BRAND } from "@/constants/brand";
import { button, detailsCard, emailLayout, escapeHtml, note, sectionTitle } from "@/features/appointment/emails/layout";

/** What every booking email shows. Date and time are already formatted for people. */
export type BookingEmailData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  /** "Tuesday, 10 November 2026" */
  displayDate: string;
  /** "Tue, 10 Nov", for subject lines. */
  shortDate: string;
  displayTime: string;
  /** Visit length from dd_settings. */
  visitMinutes: number;
  /** The booking's confirmation page on the website. */
  bookingUrl: string;
};

const slotRows = (data: BookingEmailData): [string, string][] => [
  ["Treatment", data.service],
  ["Date", data.displayDate],
  ["Time", `${data.displayTime} IST`],
  ["Duration", `${data.visitMinutes} minutes`],
];

const when = (data: BookingEmailData) => `${data.shortDate}, ${data.displayTime} IST`;
const firstName = (name: string) => escapeHtml(name.trim().split(/\s+/)[0] || name);
const RESCHEDULE = `Need a different time? Reply to this email or call us on ${BRAND.phone}.`;

// To the patient, right after they book on the website.
export const customerBookingEmail = (data: BookingEmailData) => ({
  subject: `Appointment booked for ${when(data)}`,
  html: emailLayout({
    preheader: `Your ${data.service} appointment on ${data.displayDate} at ${data.displayTime} IST.`,
    eyebrow: "Booking received",
    heading: "Your appointment is booked",
    intro: `Hi ${firstName(data.name)}, thank you for booking with ${BRAND.name}. Your slot is reserved. Our team may call you to confirm the details before your visit.`,
    body:
      button(data.bookingUrl, "View your booking") +
      sectionTitle("Your appointment") +
      detailsCard(slotRows(data)) +
      note(`Please arrive a few minutes early and bring any recent dental reports or X-rays. ${RESCHEDULE}`),
  }),
});

// Tells the team a patient booked on the website.
export const adminBookingEmail = (data: BookingEmailData) => ({
  subject: `New appointment: ${data.name}, ${when(data)}`,
  html: emailLayout({
    preheader: `${data.name} · ${data.service} · ${data.displayDate} at ${data.displayTime} IST`,
    eyebrow: "New website booking",
    heading: `${data.name} booked a visit`,
    intro: "A patient has booked an appointment on the website. It is in the admin under Appointments.",
    signOff: false,
    body:
      sectionTitle("Booking") +
      detailsCard([
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ...slotRows(data),
      ]),
  }),
});
