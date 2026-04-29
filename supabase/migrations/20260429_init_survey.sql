-- Field trip interest survey — initial schema
--
-- Single table with role discriminator + JSONB response body. Chosen because
-- this is a one-time survey whose questions may still iterate; JSONB lets us
-- tweak question shape without further migrations. Response shape validation
-- lives in app code (Zod), not in CHECK constraints.
--
-- RLS: enabled, anon + authenticated INSERT only. No SELECT policy — the
-- service role bypasses RLS for our own analysis. Anon key in browser code
-- could not read submissions even if exposed.

create table public.survey_submissions (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null    default now(),
  role        text        not null,
  responses   jsonb       not null,
  contact     jsonb,
  constraint role_valid check (role in ('teacher', 'family'))
);

create index survey_submissions_created_at_idx
  on public.survey_submissions (created_at desc);

alter table public.survey_submissions enable row level security;

create policy "anon can insert surveys"
  on public.survey_submissions
  for insert
  to anon, authenticated
  with check (true);
