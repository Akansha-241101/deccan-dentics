import "server-only";
import { env } from "@/config/env";
import { confirmedPath } from "@/constants/routes";
import { adminBookingEmail, customerBookingEmail, type BookingEmailData } from "@/features/appointment/emails/templates";
import { getBookingSettings } from "@/features/appointment/services/bookingConfig";
import { db } from "@/services/database";
import { sendMail } from "@/services/mailer";
import { formatTimeLabel } from "@/utils/admin/time";

const displayDate = (date: string) =>
  new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  });

// "Tue, 10 Nov", short enough for a subject line.
const shortDate = (date: string) =>
  new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata",
  });

// Everything an email about this appointment needs, or null when the appointment is gone.
export async function bookingEmailData(appointmentId: string): Promise<BookingEmailData | null> {
  const [[row], settings] = await Promise.all([
    db()`
      select p.name, p.email, p.phone, a.service,
        to_char(a.date, 'YYYY-MM-DD') as date, to_char(a.time, 'HH24:MI') as time
      from dd_appointments a join dd_patients p on p.id = a.patient_id where a.id = ${appointmentId}`,
    getBookingSettings(),
  ]);
  if (!row) return null;
  return {
    name: row.name,
    email: row.email ?? "",
    phone: row.phone,
    service: row.service,
    displayDate: displayDate(row.date),
    shortDate: shortDate(row.date),
    displayTime: formatTimeLabel(row.time),
    visitMinutes: settings.visitMinutes,
    bookingUrl: `${env.siteUrl()}${confirmedPath(appointmentId)}`,
  };
}

// After a website booking: the confirmation to the patient (when they gave an email) and the
// booking to the team (ADMIN_NOTIFY_EMAIL), when "Appointment emails" is on in Settings.
// sendMail never throws, so a booking never fails because of an email.
export async function sendBookingEmails(appointmentId: string) {
  const data = await bookingEmailData(appointmentId);
  if (!data) return;
  if (data.email) await sendMail({ to: data.email, ...customerBookingEmail(data) });
  if (await appointmentEmailsOn()) {
    await sendMail({ to: env.adminNotifyEmail(), replyTo: data.email || undefined, ...adminBookingEmail(data) });
  }
}

// The admin's "Appointment emails" switch (Settings page).
async function appointmentEmailsOn(): Promise<boolean> {
  const [row] = await db()`select appointment_emails from dd_settings where id`;
  return Boolean(row?.appointment_emails);
}
