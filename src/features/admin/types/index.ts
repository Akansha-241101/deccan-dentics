import type { Profile } from "@/features/auth/types";
import type { BookingSettings, OccupiedSlot } from "@/features/appointment/types/slots";
import type { Appointment } from "@/types/admin/appointment";
import type { Patient } from "@/types/admin/patient";
import type { DaySchedule } from "@/types/admin/schedule";
import type { AdminSettings } from "@/types/admin/settings";
import type { Todo } from "@/types/admin/todo";

/** Everything the admin pages show, loaded from Neon once per page load. */
export type AdminData = {
  profile: Profile;
  patients: Patient[];
  appointments: Appointment[];
  days: DaySchedule[];
  todos: Todo[];
  preferences: AdminSettings;
  settings: BookingSettings;
  services: string[];
  /** Start times hidden from the website, today on. */
  hiddenSlots: OccupiedSlot[];
};
