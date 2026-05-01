import { z } from 'zod'

export const GRADE_OPTIONS = ['K-2', '3-5', '6-8', '9-12'] as const
export const CHILD_GRADE_OPTIONS = ['Pre-school', 'K-2', '3-5', '6-8', '9-12'] as const

export const SUBJECT_OPTIONS = [
  'Science',
  'Social Studies',
  'Health',
  'Language Arts',
  'Multiple subjects',
  'Other',
] as const

export const TEACHER_TOPIC_OPTIONS = [
  'Gardening basics',
  'Where food comes from',
  'Food insecurity & community',
  'Nature & environment',
  'Nutrition & food literacy',
  'Career exploration',
  'Community service',
  'Other',
] as const

export const FAMILY_TOPIC_OPTIONS = [
  'Gardening basics',
  'Where food comes from',
  'Food insecurity & community',
  'Nature & environment',
  'Nutrition & food literacy',
  'Career exploration',
  'Community service',
  'Other',
] as const

export const FORMAT_OPTIONS = [
  'Field trip to a garden',
  'In-school visit from us',
  'Either works',
  'Not sure yet',
] as const

export const PARTICIPATION_OPTIONS = [
  'School field trip',
  'Community or family event',
  'Both',
  'Not sure yet',
] as const

export const SEASON_OPTIONS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
export const GROUP_SIZE_OPTIONS = ['Under 15', '15–30', '30+'] as const
export const BUDGET_RANGE_OPTIONS = ['Under $5', '$5–10', '$10–20', '$20+'] as const
export const TRAVEL_TIME_OPTIONS = [
  'Less than 15 min',
  '15–30 min',
  '30–60 min',
  'Over 1 hour',
] as const

export const PROGRAM_DURATION_OPTIONS = [
  'Less than 1 hour',
  '1–2 hours',
  '2–4 hours',
  'Over 4 hours',
] as const

const nonEmpty = <T extends [string, ...string[]]>(values: readonly [...T]) =>
  z.array(z.enum(values)).min(1)

const longText = z.string().trim().max(2000).optional()
const shortText = z.string().trim().max(200).optional()

const TeacherResponses = z
  .object({
    grades: nonEmpty(GRADE_OPTIONS),
    subjects: nonEmpty(SUBJECT_OPTIONS),
    subjectsOther: shortText,
    topics: nonEmpty(TEACHER_TOPIC_OPTIONS),
    topicsOther: shortText,
    format: z.enum(FORMAT_OPTIONS),
    programDuration: z.enum(PROGRAM_DURATION_OPTIONS),
    season: nonEmpty(SEASON_OPTIONS),
    groupSize: z.enum(GROUP_SIZE_OPTIONS),
    hasBudget: z.boolean(),
    budgetRange: z.enum(BUDGET_RANGE_OPTIONS).optional(),
    hasFieldTripped: z.boolean(),
    travelTime: z.enum(TRAVEL_TIME_OPTIONS),
    curricularTieIns: longText,
    priorityTieIns: longText,
    perfectVisit: longText,
    anythingElse: longText,
  })
  .superRefine((val, ctx) => {
    if (val.subjects.includes('Other') && !val.subjectsOther?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['subjectsOther'],
        message: 'Please specify',
      })
    }
    if (val.topics.includes('Other') && !val.topicsOther?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['topicsOther'],
        message: 'Please specify',
      })
    }
    if (val.hasBudget && !val.budgetRange) {
      ctx.addIssue({
        code: 'custom',
        path: ['budgetRange'],
        message: 'Please pick a range',
      })
    }
  })

const FamilyResponses = z
  .object({
    childGrades: nonEmpty(CHILD_GRADE_OPTIONS),
    topics: nonEmpty(FAMILY_TOPIC_OPTIONS),
    topicsOther: shortText,
    participation: z.enum(PARTICIPATION_OPTIONS),
    programDuration: z.enum(PROGRAM_DURATION_OPTIONS),
    season: nonEmpty(SEASON_OPTIONS),
    travelTime: z.enum(TRAVEL_TIME_OPTIONS),
    perfectExperience: longText,
    anythingElse: longText,
  })
  .superRefine((val, ctx) => {
    if (val.topics.includes('Other') && !val.topicsOther?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['topicsOther'],
        message: 'Please specify',
      })
    }
  })

const Contact = z.object({
  name: shortText,
  email: z
    .union([z.literal(''), z.string().trim().toLowerCase().email().max(200)])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  school: shortText,
})

export const TeacherSubmission = z.object({
  role: z.literal('teacher'),
  responses: TeacherResponses,
  contact: Contact.optional(),
})

export const FamilySubmission = z.object({
  role: z.literal('family'),
  responses: FamilyResponses,
  contact: Contact.optional(),
})

export const SurveySubmission = z.discriminatedUnion('role', [
  TeacherSubmission,
  FamilySubmission,
])

export type SurveySubmission = z.infer<typeof SurveySubmission>
export type TeacherResponseValues = z.infer<typeof TeacherResponses>
export type FamilyResponseValues = z.infer<typeof FamilyResponses>
