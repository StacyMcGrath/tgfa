'use client'

import { useActionState, useState, type ReactNode } from 'react'
import { submitSurvey, type ActionState } from '@/app/actions'
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
} from '@/lib/survey/schema'

type Role = 'teacher' | 'family'

type FieldErrors = Record<string, string[]>

const initialActionState: ActionState = { ok: false, error: null }

const sectionClass = 'space-y-8'
const groupClass = 'space-y-3'
const legendClass = 'text-base font-medium text-zinc-900 dark:text-zinc-100'
const requiredHintClass = 'ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400'
const optionRowClass =
  'flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer'
const inputClass =
  'w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent'
const textareaClass = `${inputClass} min-h-[88px]`
const errorTextClass = 'text-sm text-red-600 dark:text-red-400 mt-1'

export function SurveyForm() {
  const [state, action, pending] = useActionState(submitSurvey, initialActionState)
  const [role, setRole] = useState<Role | null>(null)
  const [subjectsOther, setSubjectsOther] = useState(false)
  const [teacherTopicsOther, setTeacherTopicsOther] = useState(false)
  const [familyTopicsOther, setFamilyTopicsOther] = useState(false)
  const [hasBudget, setHasBudget] = useState<boolean | null>(null)

  const errs: FieldErrors = state.fieldErrors ?? {}

  return (
    <form action={action} className={sectionClass}>
      {/* Honeypot — bots fill any input named "website"; real users don't see this. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className={groupClass}>
        <legend className={legendClass}>
          First, which best describes you?
          <span className={requiredHintClass}>Required</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <RoleOption value="teacher" label="Teacher" current={role} onSelect={setRole} />
          <RoleOption
            value="family"
            label="Parent or caregiver"
            current={role}
            onSelect={setRole}
          />
        </div>
      </fieldset>

      {role === 'teacher' && (
        <TeacherSections
          errs={errs}
          subjectsOther={subjectsOther}
          setSubjectsOther={setSubjectsOther}
          topicsOther={teacherTopicsOther}
          setTopicsOther={setTeacherTopicsOther}
          hasBudget={hasBudget}
          setHasBudget={setHasBudget}
        />
      )}

      {role === 'family' && (
        <FamilySections
          errs={errs}
          topicsOther={familyTopicsOther}
          setTopicsOther={setFamilyTopicsOther}
        />
      )}

      {role && <ContactSection role={role} errs={errs} />}

      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-800 dark:text-red-200"
        >
          {state.error}
        </div>
      )}

      {role && (
        <div className="pt-4">
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-zinc-400 disabled:cursor-not-allowed dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium px-8 py-3 transition-colors"
          >
            {pending ? 'Sending…' : 'Submit'}
          </button>
        </div>
      )}
    </form>
  )
}

function RoleOption({
  value,
  label,
  current,
  onSelect,
}: {
  value: Role
  label: string
  current: Role | null
  onSelect: (r: Role) => void
}) {
  const checked = current === value
  return (
    <label
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
        checked
          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500'
          : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
      }`}
    >
      <input
        type="radio"
        name="role"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="h-4 w-4 accent-emerald-600"
        required
      />
      <span className="text-base">{label}</span>
    </label>
  )
}

function TeacherSections({
  errs,
  subjectsOther,
  setSubjectsOther,
  topicsOther,
  setTopicsOther,
  hasBudget,
  setHasBudget,
}: {
  errs: FieldErrors
  subjectsOther: boolean
  setSubjectsOther: (v: boolean) => void
  topicsOther: boolean
  setTopicsOther: (v: boolean) => void
  hasBudget: boolean | null
  setHasBudget: (v: boolean) => void
}) {
  return (
    <div className={sectionClass}>
      <CheckboxQuestion
        name="grades"
        legend="What grade(s) do you teach?"
        options={GRADE_OPTIONS}
        required
        error={errs['responses.grades']}
      />

      <CheckboxQuestion
        name="subjects"
        legend="What subject(s) do you primarily teach?"
        options={SUBJECT_OPTIONS}
        required
        otherValue="Other"
        onOtherToggle={setSubjectsOther}
        error={errs['responses.subjects']}
      >
        {subjectsOther && (
          <SpecifyInput
            name="subjectsOther"
            placeholder="Please specify"
            error={errs['responses.subjectsOther']}
          />
        )}
      </CheckboxQuestion>

      <CheckboxQuestion
        name="topics"
        legend="Which topics would be most valuable for your students?"
        options={TEACHER_TOPIC_OPTIONS}
        required
        otherValue="Other"
        onOtherToggle={setTopicsOther}
        error={errs['responses.topics']}
      >
        {topicsOther && (
          <SpecifyInput
            name="topicsOther"
            placeholder="Please specify"
            error={errs['responses.topicsOther']}
          />
        )}
      </CheckboxQuestion>

      <RadioQuestion
        name="format"
        legend="What format would work best for your class?"
        options={FORMAT_OPTIONS}
        required
        error={errs['responses.format']}
      />

      <CheckboxQuestion
        name="season"
        legend="Which time(s) of year would work?"
        options={SEASON_OPTIONS}
        required
        error={errs['responses.season']}
      />

      <RadioQuestion
        name="groupSize"
        legend="Approximately how many students would be in your group?"
        options={GROUP_SIZE_OPTIONS}
        required
        error={errs['responses.groupSize']}
      />

      <fieldset className={groupClass}>
        <legend className={legendClass}>
          Do you have a budget for field trips?
          <span className={requiredHintClass}>Required</span>
        </legend>
        <div className="space-y-1 pt-1">
          <YesNoRadios name="hasBudget" onChange={setHasBudget} />
        </div>
        {errs['responses.hasBudget'] && (
          <p className={errorTextClass}>{errs['responses.hasBudget'][0]}</p>
        )}
        {hasBudget === true && (
          <div className="mt-4 ml-6 border-l-2 border-emerald-600/40 pl-4">
            <RadioQuestion
              name="budgetRange"
              legend="What's your typical expense per student?"
              options={BUDGET_RANGE_OPTIONS}
              required
              error={errs['responses.budgetRange']}
              dense
            />
          </div>
        )}
      </fieldset>

      <fieldset className={groupClass}>
        <legend className={legendClass}>
          Have you taken your class on a field trip before?
          <span className={requiredHintClass}>Required</span>
        </legend>
        <div className="space-y-1 pt-1">
          <YesNoRadios name="hasFieldTripped" />
        </div>
        {errs['responses.hasFieldTripped'] && (
          <p className={errorTextClass}>{errs['responses.hasFieldTripped'][0]}</p>
        )}
      </fieldset>

      <RadioQuestion
        name="travelTime"
        legend="What's a reasonable travel time for a class visit?"
        options={TRAVEL_TIME_OPTIONS}
        required
        error={errs['responses.travelTime']}
      />

      <TextareaQuestion
        name="standards"
        legend="Are there specific units or standards a farm visit could support?"
      />

      <TextareaQuestion
        name="perfectVisit"
        legend="If you could design the perfect farm visit for your students, what would it look like?"
      />

      <TextareaQuestion name="anythingElse" legend="Anything else we should know?" />
    </div>
  )
}

function FamilySections({
  errs,
  topicsOther,
  setTopicsOther,
}: {
  errs: FieldErrors
  topicsOther: boolean
  setTopicsOther: (v: boolean) => void
}) {
  return (
    <div className={sectionClass}>
      <CheckboxQuestion
        name="childGrades"
        legend="What grade(s) are your child(ren) in?"
        options={CHILD_GRADE_OPTIONS}
        required
        error={errs['responses.childGrades']}
      />

      <CheckboxQuestion
        name="topics"
        legend="Which topics would you most want your child(ren) to learn about?"
        options={FAMILY_TOPIC_OPTIONS}
        required
        otherValue="Other"
        onOtherToggle={setTopicsOther}
        error={errs['responses.topics']}
      >
        {topicsOther && (
          <SpecifyInput
            name="topicsOther"
            placeholder="Please specify"
            error={errs['responses.topicsOther']}
          />
        )}
      </CheckboxQuestion>

      <RadioQuestion
        name="participation"
        legend="How would you most likely participate?"
        options={PARTICIPATION_OPTIONS}
        required
        error={errs['responses.participation']}
      />

      <CheckboxQuestion
        name="season"
        legend="Which time(s) of year would work for your family?"
        options={SEASON_OPTIONS}
        required
        error={errs['responses.season']}
      />

      <TextareaQuestion
        name="perfectExperience"
        legend="If you could design the perfect farm experience for your child(ren), what would it look like?"
      />

      <TextareaQuestion name="anythingElse" legend="Anything else we should know?" />
    </div>
  )
}

function ContactSection({ role, errs }: { role: Role; errs: FieldErrors }) {
  return (
    <fieldset className={`${groupClass} pt-4 border-t border-zinc-200 dark:border-zinc-800`}>
      <legend className={legendClass}>
        Want updates as the program takes shape?
        <span className={requiredHintClass}>Optional — leave blank to submit anonymously</span>
      </legend>
      <div className="space-y-3 pt-2">
        <LabeledText name="contactName" label="Name" />
        <LabeledText name="contactEmail" label="Email" type="email" error={errs['contact.email']} />
        {role === 'teacher' && <LabeledText name="contactSchool" label="School" />}
      </div>
    </fieldset>
  )
}

function CheckboxQuestion({
  name,
  legend,
  options,
  required,
  otherValue,
  onOtherToggle,
  error,
  children,
}: {
  name: string
  legend: string
  options: readonly string[]
  required?: boolean
  otherValue?: string
  onOtherToggle?: (checked: boolean) => void
  error?: string[]
  children?: ReactNode
}) {
  return (
    <fieldset className={groupClass}>
      <legend className={legendClass}>
        {legend}
        {required && <span className={requiredHintClass}>Required — pick one or more</span>}
      </legend>
      <div className="space-y-1 pt-1">
        {options.map((opt) => (
          <label key={opt} className={optionRowClass}>
            <input
              type="checkbox"
              name={name}
              value={opt}
              className="mt-0.5 h-4 w-4 accent-emerald-600"
              onChange={
                otherValue && opt === otherValue
                  ? (e) => onOtherToggle?.(e.target.checked)
                  : undefined
              }
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
      {children}
      {error && <p className={errorTextClass}>{error[0]}</p>}
    </fieldset>
  )
}

function RadioQuestion({
  name,
  legend,
  options,
  required,
  error,
  dense,
}: {
  name: string
  legend: string
  options: readonly string[]
  required?: boolean
  error?: string[]
  dense?: boolean
}) {
  return (
    <fieldset className={groupClass}>
      <legend className={dense ? 'text-sm font-medium text-zinc-800 dark:text-zinc-200' : legendClass}>
        {legend}
        {required && !dense && <span className={requiredHintClass}>Required</span>}
      </legend>
      <div className="space-y-1 pt-1">
        {options.map((opt, i) => (
          <label key={opt} className={optionRowClass}>
            <input
              type="radio"
              name={name}
              value={opt}
              required={required && i === 0}
              className="mt-0.5 h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className={errorTextClass}>{error[0]}</p>}
    </fieldset>
  )
}

function YesNoRadios({
  name,
  onChange,
}: {
  name: string
  onChange?: (val: boolean) => void
}) {
  return (
    <>
      {(['Yes', 'No'] as const).map((v, i) => (
        <label key={v} className={optionRowClass}>
          <input
            type="radio"
            name={name}
            value={v}
            required={i === 0}
            className="mt-0.5 h-4 w-4 accent-emerald-600"
            onChange={onChange ? () => onChange(v === 'Yes') : undefined}
          />
          <span className="text-sm">{v}</span>
        </label>
      ))}
    </>
  )
}

function SpecifyInput({
  name,
  placeholder,
  error,
}: {
  name: string
  placeholder?: string
  error?: string[]
}) {
  return (
    <div className="ml-7 mt-2">
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        maxLength={200}
        required
        className={inputClass}
      />
      {error && <p className={errorTextClass}>{error[0]}</p>}
    </div>
  )
}

function TextareaQuestion({ name, legend }: { name: string; legend: string }) {
  return (
    <fieldset className={groupClass}>
      <legend className={legendClass}>
        {legend}
        <span className={requiredHintClass}>Optional</span>
      </legend>
      <textarea
        name={name}
        maxLength={2000}
        className={textareaClass}
        rows={3}
      />
    </fieldset>
  )
}

function LabeledText({
  name,
  label,
  type = 'text',
  error,
}: {
  name: string
  label: string
  type?: string
  error?: string[]
}) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        type={type}
        name={name}
        maxLength={200}
        className={`${inputClass} mt-1`}
        autoComplete={
          type === 'email' ? 'email' : name === 'contactName' ? 'name' : 'off'
        }
      />
      {error && <p className={errorTextClass}>{error[0]}</p>}
    </label>
  )
}
