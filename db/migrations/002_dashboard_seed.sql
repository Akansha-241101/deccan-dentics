-- 002: Sample patients and appointments for trying the admin (dashboard, calendar, lists).
-- Run once, on a database with 001: bun run db:migrate db/migrations/002_dashboard_seed.sql
-- Never run it on the live database: the patients are made up.
--
-- Every appointment follows the booking rules, read from the database itself, so the sample
-- matches whatever the Schedule page says:
--   * only inside the weekly hours in dd_schedule_slots (none on a closed day);
--   * a start every block (visit + prep, 45 minutes) from each window's opening time, so starts
--     sit on the 15-minute steps and no two blocks overlap;
--   * the last start is the visit length before the window closes;
--   * never on a slot the admin hid (dd_hidden_slots), never on top of a booking already there.
-- About a third of the possible slots are filled, from three weeks ago to ten days ahead.
-- Past ones are mostly completed (some not attended, a few cancelled); later ones are upcoming.
-- Services come from dd_services, so each sample booking uses a real service name.
begin;

with new_patients as (
  insert into dd_patients (name, phone, email, age, gender, profession, address, created_at, updated_at)
  values
    ('Ayesha Siddiqui', '98765 20001', 'ayesha.siddiqui@example.com', 29, 'Female', 'Designer', 'Manikonda, Hyderabad', now() - interval '30 days', now() - interval '2 days'),
    ('Rahul Reddy', '98765 20002', 'rahul.reddy@example.com', 35, 'Male', 'Banker', 'Kondapur, Hyderabad', now() - interval '30 days', now() - interval '2 days'),
    ('Sneha Kulkarni', '98765 20003', 'sneha.kulkarni@example.com', 31, 'Female', 'Consultant', 'Gachibowli, Hyderabad', now() - interval '29 days', now() - interval '1 day'),
    ('Mohammed Irfan', '98765 20004', 'irfan.m@example.com', 42, 'Male', 'Business owner', 'Toli Chowki, Hyderabad', now() - interval '29 days', now() - interval '1 day'),
    ('Lakshmi Prasanna', '98765 20005', 'lakshmi.p@example.com', 38, 'Female', 'School teacher', 'Malakpet, Hyderabad', now() - interval '28 days', now() - interval '1 day'),
    ('Arjun Varma', '98765 20006', 'arjun.varma@example.com', 12, 'Male', 'Student', 'Manikonda, Hyderabad', now() - interval '28 days', now()),
    ('Fatima Begum', '98765 20007', 'fatima.begum@example.com', 54, 'Female', 'Homemaker', 'Mehdipatnam, Hyderabad', now() - interval '27 days', now()),
    ('Karthik Rao', '98765 20008', 'karthik.rao@example.com', 27, 'Male', 'Software engineer', 'Kondapur, Hyderabad', now() - interval '27 days', now()),
    ('Priya Nair', '98765 20009', 'priya.nair@example.com', 33, 'Female', 'Doctor', 'Jubilee Hills, Hyderabad', now() - interval '26 days', now()),
    ('Syed Abdul Rahman', '98765 20010', 'abdul.rahman@example.com', 61, 'Male', 'Retired', 'Toli Chowki, Hyderabad', now() - interval '26 days', now()),
    ('Divya Sharma', '98765 20011', 'divya.sharma@example.com', 24, 'Female', 'Analyst', 'Madhapur, Hyderabad', now() - interval '25 days', now()),
    ('Venkatesh Goud', '98765 20012', 'venkatesh.goud@example.com', 47, 'Male', 'Civil engineer', 'Rajendra Nagar, Hyderabad', now() - interval '25 days', now()),
    ('Zara Khan', '98765 20013', 'zara.khan@example.com', 8, 'Female', 'Student', 'Malakpet, Hyderabad', now() - interval '24 days', now()),
    ('Naveen Kumar', '98765 20014', 'naveen.kumar@example.com', 39, 'Male', 'Product manager', 'Gachibowli, Hyderabad', now() - interval '24 days', now()),
    ('Harika Chowdary', '98765 20015', 'harika.c@example.com', 30, 'Female', 'Architect', 'Manikonda, Hyderabad', now() - interval '23 days', now()),
    ('Imran Pasha', '98765 20016', 'imran.pasha@example.com', 36, 'Male', 'Chef', 'Mehdipatnam, Hyderabad', now() - interval '23 days', now()),
    ('Meghana Rao', '98765 20017', 'meghana.rao@example.com', 26, 'Female', 'Marketing', 'Kondapur, Hyderabad', now() - interval '22 days', now()),
    ('Suresh Babu', '98765 20018', 'suresh.babu@example.com', 58, 'Male', 'Lawyer', 'Rajendra Nagar, Hyderabad', now() - interval '22 days', now()),
    ('Anjali Deshmukh', '98765 20019', 'anjali.d@example.com', 44, 'Female', 'HR manager', 'Banjara Hills, Hyderabad', now() - interval '21 days', now()),
    ('Rohan Mehta', '98765 20020', 'rohan.mehta@example.com', 32, 'Male', 'Founder', 'Hitech City, Hyderabad', now() - interval '21 days', now())
  returning id
),
patient_list as (
  select id, row_number() over (order by id) as n from new_patients
),
service_list as (
  select name, row_number() over (order by position, name) as n, count(*) over () as total from dd_services
),
settings as (
  select visit_minutes, prep_minutes, visit_minutes + prep_minutes as block_minutes from dd_settings where id
),
now_ist as (
  select (now() at time zone 'Asia/Kolkata') as at
),
days as (
  select ((select at from now_ist)::date + d) as day from generate_series(-21, 10) as d
),
-- Every rule-following start: from each window's opening, one block apart, up to the last start.
starts as (
  select dy.day, gs::time as start_time
  from days dy
  join dd_schedule_slots w on w.weekday = to_char(dy.day, 'FMday')
  cross join settings s
  cross join lateral generate_series(
    dy.day + w.start_time,
    dy.day + w.end_time - make_interval(mins => s.visit_minutes),
    make_interval(mins => s.block_minutes)
  ) as gs
),
picked as (
  select st.day, st.start_time, row_number() over (order by st.day, st.start_time) as k
  from starts st
  cross join settings s
  where abs(hashtext(st.day::text || st.start_time::text)) % 100 < 33
    and not exists (
      select 1 from dd_hidden_slots h where h.date = st.day and h.time = st.start_time
    )
    and not exists (
      select 1 from dd_appointments a
      where a.date = st.day and a.status <> 'cancelled'
        and a.time < st.start_time + make_interval(mins => s.block_minutes)
        and st.start_time < a.time + make_interval(mins => s.block_minutes)
    )
),
planned as (
  select
    p.*,
    case
      when p.k % 13 = 0 then 'cancelled'
      when p.day + p.start_time + make_interval(mins => s.visit_minutes) > (select at from now_ist) then 'upcoming'
      when p.k % 9 = 0 then 'not-attended'
      else 'completed'
    end as status,
    -- Booked 1 to 5 days before the slot, but never later than now (a booking is never in the future).
    least((p.day - (1 + p.k % 5)::int) + time '10:00', (select at from now_ist)) as booked_at
  from picked p
  cross join settings s
)
insert into dd_appointments (patient_id, date, time, service, status, notes, created_at, updated_at)
select
  pl_patient.id,
  pl.day,
  pl.start_time,
  sv.name,
  pl.status,
  case
    when pl.k % 11 = 0 then 'Sensitive to cold; check the lower molars'
    when pl.k % 7 = 0 then 'Follow-up after the last visit'
    when pl.k % 5 = 0 then 'Bring recent X-rays'
    else null
  end,
  pl.booked_at at time zone 'Asia/Kolkata',
  pl.booked_at at time zone 'Asia/Kolkata'
from planned pl
join patient_list pl_patient on pl_patient.n = 1 + (pl.k % 20)
join service_list sv on sv.n = 1 + (pl.k % sv.total);

commit;
