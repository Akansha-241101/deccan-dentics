-- Deccan Dentics database setup. This one file builds the whole database: run it once on an empty
-- Neon database with: bun run db:migrate   (or paste it into the Neon SQL Editor)
--
-- Before running: turn on Neon Auth (Neon Console → Auth → Enable Auth), so the
-- neon_auth."user" table exists. dd_profiles points at it.
--
-- Rules for this file: every table starts with dd_, has created_at (and updated_at when rows
-- change), uses foreign keys for real links, and adds only the indexes the app's queries need.
-- There is no payment, questionnaire or calendar data: a website booking saves a patient and an
-- appointment, nothing else.

begin;

-- Keeps updated_at current on every UPDATE. One function, used by every table below.
create or replace function dd_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin profile. Its id is the Neon Auth user id, so a profile always belongs to one sign-in.
create table dd_profiles (
  id uuid primary key references neon_auth."user"(id) on delete cascade,
  name text not null,
  email text not null,
  mobile text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking rules and admin preferences. Exactly one row (id is always true).
-- visit_minutes: one appointment's length. prep_minutes: clean-up buffer after it.
-- start_step_minutes: start times are offered on this grid. booking_days_ahead: how far ahead
-- patients can book on the website.
create table dd_settings (
  id boolean primary key default true check (id),
  visit_minutes integer not null default 30 check (visit_minutes > 0),
  prep_minutes integer not null default 15 check (prep_minutes >= 0),
  start_step_minutes integer not null default 15 check (start_step_minutes > 0),
  booking_days_ahead integer not null default 30 check (booking_days_ahead > 0),
  email_reminders boolean not null default true,
  sms_reminders boolean not null default false,
  appointment_emails boolean not null default true,
  marketing_emails boolean not null default false,
  desktop_notifications boolean not null default true,
  weekly_digest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clinic hours. A weekday with no rows is closed.
create table dd_schedule_slots (
  id uuid primary key default gen_random_uuid(),
  weekday text not null
    check (weekday in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- Dental services a booking can choose, in display order. The booking form and the admin read
-- them from here.
create table dd_services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- People who booked on the website or were added by the admin. Age, gender and the rest are
-- filled in by the admin later.
create table dd_patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  age integer check (age between 1 and 120),
  gender text check (gender in ('Female', 'Male')),
  profession text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One visit. Deleting a patient deletes their appointments.
-- service keeps the name chosen at booking, so renaming a service never changes old bookings.
create table dd_appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references dd_patients(id) on delete cascade,
  date date not null,
  time time not null,
  service text not null,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'completed', 'not-attended', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Two live (not cancelled) appointments can never start at the same moment: this stops a double
-- submit or two patients booking the same slot at once. A cancelled one frees its slot.
create unique index dd_appointments_live_slot on dd_appointments (date, time) where status <> 'cancelled';
-- The website and the admin read a day's or a patient's appointments.
create index dd_appointments_patient_id on dd_appointments (patient_id);

-- Single start times the admin hides from the website.
create table dd_hidden_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  created_at timestamptz not null default now(),
  unique (date, time)
);

-- The admin dashboard to-do list. date is the day (India time) a to-do belongs to.
create table dd_todos (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  done boolean not null default false,
  date date not null default (now() at time zone 'Asia/Kolkata')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger dd_profiles_updated_at before update on dd_profiles for each row execute function dd_set_updated_at();
create trigger dd_settings_updated_at before update on dd_settings for each row execute function dd_set_updated_at();
create trigger dd_schedule_slots_updated_at before update on dd_schedule_slots for each row execute function dd_set_updated_at();
create trigger dd_services_updated_at before update on dd_services for each row execute function dd_set_updated_at();
create trigger dd_patients_updated_at before update on dd_patients for each row execute function dd_set_updated_at();
create trigger dd_appointments_updated_at before update on dd_appointments for each row execute function dd_set_updated_at();
create trigger dd_todos_updated_at before update on dd_todos for each row execute function dd_set_updated_at();

-- Starting data: booking rules, clinic hours (Mon–Sat 9 AM – 8 PM, Sun 2 PM – 6 PM) and the
-- six dental services shown on the home page (src/data/services.ts).

insert into dd_settings (id) values (true);

insert into dd_schedule_slots (weekday, start_time, end_time) values
  ('monday', '09:00', '20:00'),
  ('tuesday', '09:00', '20:00'),
  ('wednesday', '09:00', '20:00'),
  ('thursday', '09:00', '20:00'),
  ('friday', '09:00', '20:00'),
  ('saturday', '09:00', '20:00'),
  ('sunday', '14:00', '18:00');

insert into dd_services (name, position) values
  ('Dental Implants', 1),
  ('Cosmetic Dentistry', 2),
  ('Root Canals', 3),
  ('Teeth Whitening', 4),
  ('Dental Crowns', 5),
  ('Kids Dentistry', 6);

commit;
