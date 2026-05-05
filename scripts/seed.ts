/**
 * Seeds the survey tables with realistic-looking fake data so the dashboard
 * has shape during development.
 *
 * Run:   npm run seed
 * Or:    netlify dev:exec tsx scripts/seed.ts
 *
 * Every seeded row has `contact_name` prefixed with `TEST -` so cleanup is
 * a single SQL statement (printed at the end of this script's output).
 */

import { createClient } from '@supabase/supabase-js'
import {
  GRADE_OPTIONS,
  CHILD_GRADE_OPTIONS,
  SUBJECT_OPTIONS,
  TEACHER_TOPIC_OPTIONS,
  FAMILY_TOPIC_OPTIONS,
  FORMAT_OPTIONS,
  PARTICIPATION_OPTIONS,
  SEASON_OPTIONS,
  GROUP_SIZE_OPTIONS,
  BUDGET_RANGE_OPTIONS,
  TRAVEL_TIME_OPTIONS,
  PROGRAM_DURATION_OPTIONS,
} from '@/lib/survey/schema'

// ─── Config ────────────────────────────────────────────────────────────────

const TEACHER_COUNT = 50
const FAMILY_COUNT = 30
const SPREAD_DAYS = 90 // how far back created_at can go

// ─── Supabase ──────────────────────────────────────────────────────────────

const url =
  process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing env vars. Need:')
  console.error('  - NEXT_PUBLIC_SUPABASE_DATABASE_URL (or SUPABASE_DATABASE_URL)')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Run with: npm run seed (or `netlify dev:exec tsx scripts/seed.ts`)')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ─── Random helpers ────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickMulti<T>(arr: readonly T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

function weighted<T>(options: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < options.length; i++) {
    r -= weights[i]
    if (r <= 0) return options[i]
  }
  return options[options.length - 1]
}

function maybe<T>(chance: number, fn: () => T): T | null {
  return Math.random() < chance ? fn() : null
}

function recentDateISO(): string {
  // Weighted toward recent: 60% past 30d, 25% past 60d, 15% past 90d
  const r = Math.random()
  let daysAgo: number
  if (r < 0.6) daysAgo = Math.floor(Math.random() * 30)
  else if (r < 0.85) daysAgo = 30 + Math.floor(Math.random() * 30)
  else daysAgo = 60 + Math.floor(Math.random() * (SPREAD_DAYS - 60))
  // Add a random hour-of-day for spread within the bucket
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ─── Pools ─────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery',
  'Quinn', 'Drew', 'Skyler', 'Reese', 'Blake', 'Cameron', 'Dakota', 'Emerson',
  'Finley', 'Harper', 'Jamie', 'Kendall', 'Logan', 'Parker', 'Rowan', 'Sage',
]
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
]
const SCHOOLS = [
  'Maple Grove Elementary', 'Riverside Middle School', 'Oak Hill High School',
  'Pinecrest Academy', 'Westgate Elementary', 'Northside Middle', 'Sunrise Charter',
  'Cedar Park K-8', 'Hillcrest High', 'Lakeshore Elementary',
]

// "Other" write-ins for subjects (when teacher picks Other on subjects)
const SUBJECTS_OTHER_POOL = [
  'AVID',
  'Special Education',
  'Robotics',
  'Environmental Science',
  'STEM enrichment',
  'ESL / ELL',
  'Library / Media',
  'Drama',
]

// "Other" write-ins for topics
const TOPICS_OTHER_POOL = [
  'Composting',
  'Pollinators',
  'Climate science',
  'Seed saving',
  'Cultural foods',
  'Local agriculture history',
]

// Open-text pools
const TEACHER_CURRICULAR = [
  'We cover plant biology in fourth grade and would love a hands-on extension.',
  'I teach Earth Science. Food systems and ecology would tie in directly.',
  'Looking for ways to make our nutrition unit more concrete for students.',
  'We have a unit on community helpers — seeing food production in action would help.',
  'Photosynthesis and plant life cycles are key NGSS standards we cover each spring.',
  'My class explores food insecurity as part of our community studies block.',
  'Composting and the nitrogen cycle could anchor our environmental science unit.',
  'Our health curriculum touches on nutrition; a garden visit would make it concrete.',
  'We do a "where does our food come from" project — this would be perfect.',
  'I teach AP Environmental Science. Real-world ecosystems are gold for us.',
]
const TEACHER_PRIORITIES = [
  'Our district has a strong focus on community service — a garden visit would align.',
  "We're working on social-emotional learning; the calm of a garden setting would help.",
  'Equity and food access is a district priority this year.',
  'Career exploration is a big push for our middle schoolers.',
  'Our school has a wellness initiative that this would slot into nicely.',
  'We focus on community partnerships, especially with local nonprofits.',
  'Sustainability is one of our strategic plan pillars.',
  'Our principal is interested in hands-on, place-based learning.',
]
const TEACHER_PERFECT_VISIT = [
  'A short walk-through, then small-group activities like planting or harvesting.',
  'Hands-on work in the garden, plus time to ask questions and reflect afterward.',
  "I'd love a chance for kids to taste fresh produce they've helped pick.",
  'Stations: one on composting, one on planting, one on tasting.',
  'A guided tour explaining the donation work, then planting time.',
  'Something that connects directly to our current unit, with a take-home component.',
  'Free exploration time alongside a structured activity. Lots of unstructured time matters at this age.',
]
const TEACHER_ANYTHING = [
  'Buses are our biggest barrier — funding for transportation would help.',
  'Make sure activities work for kids with food allergies.',
  'Materials in Spanish would be great for some of our families.',
  'Accessibility for kids with mobility needs is important to consider.',
  'Tying it to a service-learning component would strengthen the experience.',
]
const FAMILY_PERFECT = [
  'A relaxed visit where my kids can dig and plant and just be outside.',
  'Something interactive — they get bored on tour-style outings.',
  'Tasting and harvesting would be the highlight for my crew.',
  'Garden-based crafts or storytelling alongside the practical stuff.',
  'A family event with food, music, and time to wander.',
  'I would love for them to learn where their food comes from in a real way.',
  'Honestly, anything outside, hands-on, and not too long.',
]
const FAMILY_ANYTHING = [
  'Weekend timing works much better for us than weekdays.',
  'Sliding-scale or free events would be more accessible.',
  'My oldest has sensory needs — knowing in advance what to expect helps a lot.',
  'Sibling-friendly programming (different ages welcome) would be huge.',
]

// ─── Teacher generator ─────────────────────────────────────────────────────

function generateTeacher(i: number) {
  const grades = pickMulti(GRADE_OPTIONS, 1, 2)
  const subjects = pickMulti(SUBJECT_OPTIONS, 1, 2)
  const subjectsOther = subjects.includes('Other') ? pick(SUBJECTS_OTHER_POOL) : null
  const topics = pickMulti(TEACHER_TOPIC_OPTIONS, 2, 4)
  const topicsOther = topics.includes('Other') ? pick(TOPICS_OTHER_POOL) : null
  const hasBudget = Math.random() < 0.4

  return {
    grades,
    subjects,
    subjects_other: subjectsOther,
    topics,
    topics_other: topicsOther,
    format: weighted(FORMAT_OPTIONS, [50, 25, 20, 5]),
    program_duration: weighted(PROGRAM_DURATION_OPTIONS, [10, 50, 30, 10]),
    season: pickMulti(SEASON_OPTIONS, 1, 3),
    group_size: weighted(GROUP_SIZE_OPTIONS, [25, 60, 15]),
    has_budget: hasBudget,
    budget_range: hasBudget ? weighted(BUDGET_RANGE_OPTIONS, [40, 35, 20, 5]) : null,
    has_field_tripped: Math.random() < 0.7,
    travel_time: weighted(TRAVEL_TIME_OPTIONS, [10, 30, 35, 25]),
    curricular_tie_ins: maybe(0.65, () => pick(TEACHER_CURRICULAR)),
    priority_tie_ins: maybe(0.5, () => pick(TEACHER_PRIORITIES)),
    perfect_visit: maybe(0.45, () => pick(TEACHER_PERFECT_VISIT)),
    anything_else: maybe(0.2, () => pick(TEACHER_ANYTHING)),
    contact_name: `TEST - ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    contact_email: `seed-teacher-${i}@example.com`,
    contact_school: pick(SCHOOLS),
    created_at: recentDateISO(),
  }
}

function generateFamily(i: number) {
  const childGrades = pickMulti(CHILD_GRADE_OPTIONS, 1, 3)
  const topics = pickMulti(FAMILY_TOPIC_OPTIONS, 2, 4)
  const topicsOther = topics.includes('Other') ? pick(TOPICS_OTHER_POOL) : null

  return {
    child_grades: childGrades,
    topics,
    topics_other: topicsOther,
    participation: weighted(PARTICIPATION_OPTIONS, [30, 30, 30, 10]),
    program_duration: weighted(PROGRAM_DURATION_OPTIONS, [25, 45, 20, 10]),
    season: pickMulti(SEASON_OPTIONS, 1, 3),
    travel_time: weighted(TRAVEL_TIME_OPTIONS, [15, 40, 35, 10]),
    perfect_experience: maybe(0.55, () => pick(FAMILY_PERFECT)),
    anything_else: maybe(0.25, () => pick(FAMILY_ANYTHING)),
    contact_name: `TEST - ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    contact_email: `seed-family-${i}@example.com`,
    created_at: recentDateISO(),
  }
}

// ─── Run ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${TEACHER_COUNT} teacher rows + ${FAMILY_COUNT} family rows…`)

  const teacherRows = Array.from({ length: TEACHER_COUNT }, (_, i) => generateTeacher(i))
  const familyRows = Array.from({ length: FAMILY_COUNT }, (_, i) => generateFamily(i))

  const teacherInsert = await supabase.from('teacher_submissions').insert(teacherRows)
  if (teacherInsert.error) {
    console.error('teacher_submissions insert failed:', teacherInsert.error)
    process.exit(1)
  }
  console.log(`  ✓ ${TEACHER_COUNT} teacher rows`)

  const familyInsert = await supabase.from('family_submissions').insert(familyRows)
  if (familyInsert.error) {
    console.error('family_submissions insert failed:', familyInsert.error)
    process.exit(1)
  }
  console.log(`  ✓ ${FAMILY_COUNT} family rows`)

  console.log('')
  console.log('Done. To wipe seed data, run in the Supabase SQL Editor:')
  console.log('')
  console.log("  delete from teacher_submissions where contact_name like 'TEST -%';")
  console.log("  delete from family_submissions where contact_name like 'TEST -%';")
  console.log('')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
