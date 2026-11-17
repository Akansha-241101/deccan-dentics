import { CalendarCheck2, CalendarClock, CalendarX2, UserPlus } from "lucide-react";
import type { Appointment } from "@/types/admin/appointment";
import type { Patient } from "@/types/admin/patient";
import type { DashboardFilters, StatsCardModel } from "@/types/admin/dashboard";
import {
  getCustomPreviousWindow,
  getCustomWindow,
  getPreviousWindow,
  getRangeWindow,
  trendLabelFor,
  type DateWindow,
} from "@/utils/admin/dashboardRange";
import { countNewPatients, countWithStatus, percentChange } from "@/utils/admin/dashboardStatsCount";

type Count = (window: DateWindow) => number;

// The four dashboard cards: upcoming, completed, not attended and new patients.
export function buildDashboardStats(
  appointments: Appointment[],
  patients: Patient[],
  filters: DashboardFilters,
  reference: Date,
): StatsCardModel[] {
  const hasCustom = Boolean(filters.dateRange?.from);
  const current = hasCustom ? getCustomWindow(filters.dateRange!) : getRangeWindow(filters.range, reference);
  const previous = hasCustom ? getCustomPreviousWindow(filters.dateRange!) : getPreviousWindow(filters.range, reference);
  const trendLabel = trendLabelFor(filters.range, hasCustom);
  if (!current) return [];

  // The value now, and its change against the window before (none for "all time").
  const measure = (count: Count) => {
    const now = count(current);
    const before = previous ? count(previous) : null;
    return { now, trendPercent: before === null ? null : percentChange(now, before) };
  };
  const upcoming = measure((w) => countWithStatus(appointments, "upcoming", filters, w));
  const completed = measure((w) => countWithStatus(appointments, "completed", filters, w));
  const missed = measure((w) => countWithStatus(appointments, "not-attended", filters, w));
  const newPatients = measure((w) => countNewPatients(patients, w));

  return [
    { id: "upcoming", label: "Appointments Upcoming", value: String(upcoming.now), icon: CalendarClock, tone: "teal", trendPercent: upcoming.trendPercent, trendLabel },
    { id: "completed", label: "Appointments Completed", value: String(completed.now), icon: CalendarCheck2, tone: "leaf", trendPercent: completed.trendPercent, trendLabel },
    { id: "not-attended", label: "Not Attended", value: String(missed.now), icon: CalendarX2, tone: "gold", trendPercent: missed.trendPercent, trendLabel },
    { id: "new-patients", label: "New Patients", value: String(newPatients.now), icon: UserPlus, tone: "coral", trendPercent: newPatients.trendPercent, trendLabel },
  ];
}
