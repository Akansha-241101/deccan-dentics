import { matchesAgeFilter } from "@/constants/admin/patients/ageFilters";
import type { Patient } from "@/types/admin/patient";
import { parseISO } from "date-fns";
import { adminNow } from "@/constants/admin/dashboard/reference";
import { isInDateRange, matchesDatePreset } from "@/utils/admin/dateRange";
import type { PatientListFilters } from "@/types/admin/patient";

export type { PatientListFilters };

// Newest added first by default, or oldest first.
function sortPatients(items: Patient[], sort: PatientListFilters["sort"]) {
  return [...items].sort((a, b) =>
    sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
  );
}

export function filterPatients(patients: Patient[], filters: PatientListFilters): Patient[] {
  const query = filters.query.trim().toLowerCase();
  const reference = parseISO(adminNow());

  const shown = patients.filter((patient) => {
    if (!matchesAgeFilter(patient.age, filters.age)) return false;
    if (!matchesDatePreset(patient.createdAt, filters.date, reference)) return false;
    if (!isInDateRange(patient.createdAt, filters.dateRange)) return false;
    if (!query) return true;
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.phone.toLowerCase().includes(query) ||
      (patient.profession?.toLowerCase().includes(query) ?? false)
    );
  });
  return sortPatients(shown, filters.sort);
}
