-- Field trip interest survey — schema
--
-- Two structured tables, one per survey branch, with typed columns per
-- question. text[] for multi-selects, text + CHECK for single-selects,
-- boolean for Y/N gates. Reporting and CSV export stay clean —
-- e.g. "select format, count(*) from teacher_submissions group by format".
--
-- RLS: enabled. anon + authenticated INSERT only. No SELECT policy means
-- only the service role (server-side code) can read submissions.
--
-- The DROPs at the top handle the upgrade path from earlier iterations
-- (single JSONB table, or earlier versions of these structured tables).
-- No data loss expected since the survey has not gone live.

drop table if exists public.survey_submissions cascade;
drop table if exists public.teacher_submissions cascade;
drop table if exists public.family_submissions cascade;

-- ============================================================================
-- Teacher branch
-- ============================================================================

create table public.teacher_submissions (
  id                  uuid        primary key default gen_random_uuid(),
  created_at          timestamptz not null    default now(),

  grades              text[]      not null,
  subjects            text[]      not null,
  subjects_other      text,
  topics              text[]      not null,
  topics_other        text,
  format              text        not null,
  program_duration    text        not null,
  season              text[]      not null,
  group_size          text        not null,
  has_budget          boolean     not null,
  budget_range        text,
  has_field_tripped   boolean     not null,
  travel_time         text        not null,
  curricular_tie_ins  text,
  priority_tie_ins    text,
  perfect_visit       text,
  anything_else       text,

  contact_name        text,
  contact_email       text,
  contact_school      text,

  constraint teacher_grades_nonempty   check (cardinality(grades)   > 0),
  constraint teacher_subjects_nonempty check (cardinality(subjects) > 0),
  constraint teacher_topics_nonempty   check (cardinality(topics)   > 0),
  constraint teacher_season_nonempty   check (cardinality(season)   > 0),

  constraint teacher_format_valid check (format in (
    'Field trip to a garden',
    'In-school visit from us',
    'Either works',
    'Not sure yet'
  )),
  constraint teacher_program_duration_valid check (program_duration in (
    'Less than 1 hour', '1–2 hours', '2–4 hours', 'Over 4 hours'
  )),
  constraint teacher_group_size_valid check (group_size in (
    'Under 15', '15–30', '30+'
  )),
  constraint teacher_budget_range_valid check (
    budget_range is null or budget_range in (
      'Under $5', '$5–10', '$10–20', '$20+'
    )
  ),
  constraint teacher_travel_time_valid check (travel_time in (
    'Less than 15 min', '15–30 min', '30–60 min', 'Over 1 hour'
  )),

  constraint teacher_subjects_other_len     check (subjects_other     is null or char_length(subjects_other)     <= 200),
  constraint teacher_topics_other_len       check (topics_other       is null or char_length(topics_other)       <= 200),
  constraint teacher_curricular_tie_ins_len check (curricular_tie_ins is null or char_length(curricular_tie_ins) <= 2000),
  constraint teacher_priority_tie_ins_len   check (priority_tie_ins   is null or char_length(priority_tie_ins)   <= 2000),
  constraint teacher_perfect_visit_len      check (perfect_visit      is null or char_length(perfect_visit)      <= 2000),
  constraint teacher_anything_else_len      check (anything_else      is null or char_length(anything_else)      <= 2000),
  constraint teacher_contact_name_len       check (contact_name       is null or char_length(contact_name)       <= 200),
  constraint teacher_contact_email_len      check (contact_email      is null or char_length(contact_email)      <= 200),
  constraint teacher_contact_school_len     check (contact_school     is null or char_length(contact_school)     <= 200)
);

create index teacher_submissions_created_at_idx
  on public.teacher_submissions (created_at desc);

alter table public.teacher_submissions enable row level security;

create policy "anon can insert teacher surveys"
  on public.teacher_submissions
  for insert
  to anon, authenticated
  with check (true);

-- ============================================================================
-- Parent / caregiver branch
-- ============================================================================

create table public.family_submissions (
  id                  uuid        primary key default gen_random_uuid(),
  created_at          timestamptz not null    default now(),

  child_grades        text[]      not null,
  topics              text[]      not null,
  topics_other        text,
  participation       text        not null,
  program_duration    text        not null,
  season              text[]      not null,
  travel_time         text        not null,
  perfect_experience  text,
  anything_else       text,

  contact_name        text,
  contact_email       text,

  constraint family_child_grades_nonempty check (cardinality(child_grades) > 0),
  constraint family_topics_nonempty       check (cardinality(topics)       > 0),
  constraint family_season_nonempty       check (cardinality(season)       > 0),

  constraint family_participation_valid check (participation in (
    'School field trip',
    'Community or family event',
    'Both',
    'Not sure yet'
  )),
  constraint family_program_duration_valid check (program_duration in (
    'Less than 1 hour', '1–2 hours', '2–4 hours', 'Over 4 hours'
  )),
  constraint family_travel_time_valid check (travel_time in (
    'Less than 15 min', '15–30 min', '30–60 min', 'Over 1 hour'
  )),

  constraint family_topics_other_len       check (topics_other       is null or char_length(topics_other)       <= 200),
  constraint family_perfect_experience_len check (perfect_experience is null or char_length(perfect_experience) <= 2000),
  constraint family_anything_else_len      check (anything_else      is null or char_length(anything_else)      <= 2000),
  constraint family_contact_name_len       check (contact_name       is null or char_length(contact_name)       <= 200),
  constraint family_contact_email_len      check (contact_email      is null or char_length(contact_email)      <= 200)
);

create index family_submissions_created_at_idx
  on public.family_submissions (created_at desc);

alter table public.family_submissions enable row level security;

create policy "anon can insert family surveys"
  on public.family_submissions
  for insert
  to anon, authenticated
  with check (true);
