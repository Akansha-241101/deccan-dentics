import "server-only";
import { db } from "@/services/database";

/** What the confirmation page shows. */
export type ConfirmedBooking = {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
};

// A booking for the confirmation page, or null when it is unknown or cancelled.
export async function getConfirmedBooking(id: string): Promise<ConfirmedBooking | null> {
  const [row] = await db()`
    select a.id, p.name, a.service,
      to_char(a.date, 'YYYY-MM-DD') as date, to_char(a.time, 'HH24:MI') as time
    from dd_appointments a join dd_patients p on p.id = a.patient_id
    where a.id = ${id} and a.status <> 'cancelled'`;
  if (!row) return null;
  return { id: String(row.id), name: row.name, service: row.service, date: row.date, time: row.time };
}
