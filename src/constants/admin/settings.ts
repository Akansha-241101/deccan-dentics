import type { AdminSettings, AdminSettingsKey } from "@/types/admin/settings";

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  emailReminders: true,
  smsReminders: false,
  appointmentEmails: true,
  marketingEmails: false,
  desktopNotifications: true,
  weeklyDigest: true,
};

export const SETTINGS_TOGGLES: {
  key: AdminSettingsKey;
  title: string;
  description: string;
}[] = [
  {
    key: "emailReminders",
    title: "Email reminders",
    description: "Send appointment reminders to patients by email.",
  },
  {
    key: "smsReminders",
    title: "SMS reminders",
    description: "Send short text reminders before appointments.",
  },
  {
    key: "appointmentEmails",
    title: "Booking emails",
    description: "Email the clinic (ADMIN_NOTIFY_EMAIL) when a patient books on the website.",
  },
  {
    key: "marketingEmails",
    title: "Marketing emails",
    description: "Occasional dental care tips and clinic updates.",
  },
  {
    key: "desktopNotifications",
    title: "Desktop notifications",
    description: "Show alerts in the admin browser tab.",
  },
  {
    key: "weeklyDigest",
    title: "Weekly digest",
    description: "A Monday summary of appointments and open todos.",
  },
];
