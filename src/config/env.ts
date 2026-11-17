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
  // The address this deployment is reached at: SITE_URL when set, else Vercel's production
  // address (the custom domain once it is added), else the live site. Used for share previews,
  // canonical links and email links, so they never point at a host that lacks the page.
  siteUrl: () =>
    optional("SITE_URL") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "https://dddental.in",
};
