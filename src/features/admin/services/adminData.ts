import "server-only";
import type { AdminData } from "@/features/admin/types";
import { getPreferences, listAppointments, listHiddenSlots, listPatients, listTodos } from "@/features/admin/services/adminQueries";
import { getBookingSettings, getScheduleDays, getServices } from "@/features/appointment/services/bookingConfig";
import type { AdminUser } from "@/features/auth/types";
import { ensureProfile } from "@/features/auth/services/profiles";

// Everything the admin pages need, read from Neon in parallel.
export async function loadAdminData(admin: AdminUser): Promise<AdminData> {
  const [profile, patients, appointments, days, todos, preferences, settings, services, hiddenSlots] = await Promise.all([
    ensureProfile(admin),
    listPatients(),
    listAppointments(),
    getScheduleDays(),
    listTodos(),
    getPreferences(),
    getBookingSettings(),
    getServices(),
    listHiddenSlots(),
  ]);
  return { profile, patients, appointments, days, todos, preferences, settings, services, hiddenSlots };
}
