import type { AdminNavItem } from "@/types/admin/nav";

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", exact: true },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/account", label: "Account" },
  { href: "/admin/settings", label: "Settings" },
];
