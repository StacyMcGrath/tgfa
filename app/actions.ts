'use server'

import { redirect } from 'next/navigation'
import { getServiceRoleClient } from '@/lib/supabase/server'
import { SurveySubmission } from '@/lib/survey/schema'

export type ActionState = {
  ok: boolean
  error: string | null
  fieldErrors?: Record<string, string[]>
}

export async function submitSurvey(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (typeof formData.get('website') === 'string' && (formData.get('website') as string).trim() !== '') {
    redirect('/thanks')
  }

  const role = formData.get('role')
  if (role !== 'teacher' && role !== 'family') {
    return {
      ok: false,
      error: 'Please choose whether you are a teacher or a parent / caregiver.',
    }
  }

  const payload =
    role === 'teacher'
      ? { role: 'teacher' as const, responses: buildTeacherResponses(formData), contact: buildContact(formData, true) }
      : { role: 'family' as const, responses: buildFamilyResponses(formData), contact: buildContact(formData, false) }

  const parsed = SurveySubmission.safeParse(payload)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      if (!fieldErrors[key]) fieldErrors[key] = []
      fieldErrors[key].push(issue.message)
    }
    return {
      ok: false,
      error: 'A few answers need attention.',
      fieldErrors,
    }
  }

  const supabase = getServiceRoleClient()
  const { error } = await supabase.from('survey_submissions').insert({
    role: parsed.data.role,
    responses: parsed.data.responses,
    contact: parsed.data.contact ?? null,
  })

  if (error) {
    console.error('survey_submissions insert failed:', error)
    return {
      ok: false,
      error: 'Sorry, something went wrong saving your response. Please try again.',
    }
  }

  redirect('/thanks')
}

function text(fd: FormData, name: string): string | undefined {
  const v = fd.get(name)
  if (typeof v !== 'string') return undefined
  const trimmed = v.trim()
  return trimmed === '' ? undefined : trimmed
}

function all(fd: FormData, name: string): string[] {
  return fd.getAll(name).filter((v): v is string => typeof v === 'string')
}

function bool(fd: FormData, name: string): boolean | undefined {
  const v = fd.get(name)
  if (v === 'Yes') return true
  if (v === 'No') return false
  return undefined
}

function buildTeacherResponses(fd: FormData) {
  return {
    grades: all(fd, 'grades'),
    subjects: all(fd, 'subjects'),
    subjectsOther: text(fd, 'subjectsOther'),
    topics: all(fd, 'topics'),
    topicsOther: text(fd, 'topicsOther'),
    format: text(fd, 'format'),
    season: all(fd, 'season'),
    groupSize: text(fd, 'groupSize'),
    hasBudget: bool(fd, 'hasBudget'),
    budgetRange: text(fd, 'budgetRange'),
    hasFieldTripped: bool(fd, 'hasFieldTripped'),
    travelTime: text(fd, 'travelTime'),
    standards: text(fd, 'standards'),
    perfectVisit: text(fd, 'perfectVisit'),
    anythingElse: text(fd, 'anythingElse'),
  }
}

function buildFamilyResponses(fd: FormData) {
  return {
    childGrades: all(fd, 'childGrades'),
    topics: all(fd, 'topics'),
    topicsOther: text(fd, 'topicsOther'),
    participation: text(fd, 'participation'),
    season: all(fd, 'season'),
    perfectExperience: text(fd, 'perfectExperience'),
    anythingElse: text(fd, 'anythingElse'),
  }
}

function buildContact(fd: FormData, includeSchool: boolean) {
  const name = text(fd, 'contactName')
  const email = text(fd, 'contactEmail')
  const school = includeSchool ? text(fd, 'contactSchool') : undefined
  if (!name && !email && !school) return undefined
  return { name, email, school }
}
