# Database, Auth and Email (Neon + SMTP)

Deccan Dentics stores everything in one Neon Postgres database. Admin sign-in uses Neon Auth (Managed Better Auth), so admin users live in the same database (`neon_auth."user"`). Booking emails go out over SMTP with Nodemailer.

The admin, booking flow, auth and email code follow the Eatrrite implementation. The differences: there is no payment (Razorpay), no questionnaire, no Google Meet / Google Calendar (Apps Script), and leads are called **patients**.

## Setup (once)

1. Create a new Neon project for Deccan Dentics. Open **Auth** and click **Enable Auth**. Copy the Auth URL from **Settings → Better Auth → Project Info**.
2. Fill in `.env.local` (copy of `.env.example`; every value is empty until you add it):
   - `DATABASE_URL`: the Neon connection string
   - `NEON_AUTH_BASE_URL`: the Auth URL from step 1
   - `NEON_AUTH_COOKIE_SECRET`: at least 32 characters (`openssl rand -base64 32`)
   - `ADMIN_EMAILS`: who may sign up and open the admin, comma separated
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_FROM_NAME`: the mail account (Gmail needs an app password)
   - `ADMIN_NOTIFY_EMAIL`: who gets the clinic's new-booking email (comma separated)
   - `SITE_URL`: optional; the address used in email links (defaults to https://dddental.in)
3. Run `bun run db:migrate` from the project root. It sends `db/migrations/001_initial.sql` to Neon as one transaction, so it either all runs or nothing is saved. It needs step 1 first, because `dd_profiles` points at `neon_auth."user"`.
4. Start the app and open `/admin/signup`. Sign up with an admin email. The profile row is created on first sign-in.
5. Optional, for trying the admin only (never on the live database): `bun run db:migrate db/migrations/002_dashboard_seed.sql` adds 20 sample patients and about 140 appointments from three weeks ago to ten days ahead, all inside the clinic hours, without overlaps, using the services in `dd_services`.

Without SMTP settings the app still works: emails are skipped with a log line, and a booking never fails because of an email.

## Tables

All tables start with `dd_`. Each has `created_at` (and `updated_at` when rows change); one trigger function (`dd_set_updated_at`) keeps `updated_at` current.

| Table | Holds | Links |
|---|---|---|
| `dd_profiles` | Admin profile: name, email, mobile, address | `id` is the Neon Auth user id |
| `dd_settings` | One row: visit length, prep buffer, start step, booking window, admin notification toggles | – |
| `dd_schedule_slots` | Clinic hours per weekday (a day with no rows is closed) | – |
| `dd_services` | The six dental services on the home page, which a booking can choose (booking form and admin read them) | – |
| `dd_patients` | People who booked on the website or were added by the admin | – |
| `dd_appointments` | One visit: date, time, service, status, notes | `patient_id` → `dd_patients` (cascade) |
| `dd_hidden_slots` | Start times the admin hid from the website | – |
| `dd_todos` | The admin dashboard to-do list, each on an India date | – |

`dd_appointments_live_slot` is a unique index on `(date, time)` for appointments that are not cancelled, so two bookings can never land on the same start time.

## How the code reads and writes

- `src/services/database.ts` gives one SQL client (`db()`), server only. Queries use tagged templates, never string-built SQL.
- **Admin:** the admin layout checks the session, loads everything from Neon on the server and fills the zustand store. Each change updates the store at once and is saved through a server action (`src/stores/saveOrRevert.ts`); if saving fails the change is undone and the toast says why.
- **Website booking:** `/book` reads the services, hours and visit length from Neon. The slot picker loads open times from `GET /api/slots`. `POST /api/appointments` validates the details, checks the slot, finds or creates the patient (matched by phone), creates the appointment, then sends the emails (`src/features/appointment/services/bookingEmails.ts`) and opens `/appointment-confirmed`.
- **Emails:** `src/services/mailer.ts` (Nodemailer) with templates in `src/features/appointment/emails/`. The patient gets a confirmation; the clinic gets a new-booking email while **Booking emails** is on in Admin → Settings.
- **Auth:** `src/features/auth/` holds the Neon Auth server instance, sign-in, sign-up, sign-out and password reset. `src/proxy.ts` sends anyone without a session from `/admin` to `/admin/login`; the admin layout also checks the email is in `ADMIN_EMAILS`.
