// Server-only settings from .env.local. Never import this in a client component.
function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

// Optional settings: an empty string when not set, so a feature can fall back (for example
// skipping an email in development).
const optional = (name: string) => process.env[name]?.trim() ?? "";

export const env = {
  databaseUrl: () => readEnv("DATABASE_URL"),
  neonAuthBaseUrl: () => readEnv("NEON_AUTH_BASE_URL"),
  neonAuthCookieSecret: () => readEnv("NEON_AUTH_COOKIE_SECRET"),
  adminEmails: () => readEnv("ADMIN_EMAILS"),
  smtpHost: () => optional("SMTP_HOST"),
  smtpPort: () => Number(optional("SMTP_PORT") || 587),
  smtpUser: () => optional("SMTP_USER"),
  smtpPass: () => optional("SMTP_PASS"),
  mailFrom: () => optional("MAIL_FROM"),
  mailFromName: () => optional("MAIL_FROM_NAME") || "Deccan Dentics",
  adminNotifyEmail: () => optional("ADMIN_NOTIFY_EMAIL"),
  // Public URL for share previews, canonical links, and email links.
  // Prefer SITE_URL; otherwise use the host-provided production URL when present.
  siteUrl: () =>
    optional("SITE_URL") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ""),
};
