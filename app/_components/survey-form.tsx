'use client'

import { useActionState, useState, type ReactNode } from 'react'
import { submitSurvey, type ActionState, type SubmittedValues } from '@/app/actions'
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

type Role = 'teacher' | 'family'

type FieldErrors = Record<string, string[]>

const initialActionState: ActionState = { ok: false, error: null }

const sectionClass = 'space-y-8'
const groupClass = 'space-y-3'
const legendClass = 'text-lg font-semibold text-zinc-900'
const requiredHintClass = 'ml-2 text-xs font-normal text-zinc-500'
const optionRowClass =
  'flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-zinc-100 transition-colors cursor-pointer'
const inputClass =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue focus:border-transparent'
const textareaClass = `${inputClass} min-h-[88px]`
const errorTextClass = 'text-sm text-red-600 mt-1'

export function SurveyForm() {
  const [state, action, pending] = useActionState(submitSurvey, initialActionState)
  const values = state.values
  const [role, setRole] = useState<Role | null>(null)
  const [subjectsOther, setSubjectsOther] = useState(false)
  const [teacherTopicsOther, setTeacherTopicsOther] = useState(false)
  const [familyTopicsOther, setFamilyTopicsOther] = useState(false)
  const [hasBudget, setHasBudget] = useState<boolean | null>(null)
  const [seenValues, setSeenValues] = useState<SubmittedValues | undefined>(undefined)

  // When the server action returns new values (after a validation error),
  // sync the conditional-UI state so role gate, "Other → specify", and
  // budget-range sections re-appear matching what was submitted. Compares
  // against `seenValues` so this only runs when values actually change —
  // following React's "adjusting state on prop change" pattern.
  if (values !== seenValues) {
    setSeenValues(values)
    if (values?.role === 'teacher' || values?.role === 'family') {
      setRole(values.role)
    }
    if (values?.subjects) {
      setSubjectsOther(values.subjects.includes('Other'))
    }
    if (values?.topics) {
      if (values.role === 'teacher') {
        setTeacherTopicsOther(values.topics.includes('Other'))
      } else if (values.role === 'family') {
        setFamilyTopicsOther(values.topics.includes('Other'))
      }
    }
    if (values?.hasBudget === 'Yes') setHasBudget(true)
    else if (values?.hasBudget === 'No') setHasBudget(false)
  }

  const errs: FieldErrors = state.fieldErrors ?? {}

  return (
    <form action={action} className={sectionClass} noValidate>
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
          values={values}
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
          values={values}
          errs={errs}
          topicsOther={familyTopicsOther}
          setTopicsOther={setFamilyTopicsOther}
        />
      )}

      {role && <ContactSection role={role} errs={errs} values={values} />}

      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </div>
      )}

      {role && (
        <div className="pt-4">
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto rounded-full bg-brand-dark-blue hover:bg-brand-dark-blue/90 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium px-8 py-3 transition-colors"
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
          ? 'border-brand-dark-blue bg-brand-dark-blue/10'
          : 'border-zinc-300 hover:border-zinc-400'
      }`}
    >
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={checked}
        onChange={() => onSelect(value)}
        className="h-4 w-4 accent-brand-dark-blue"
      />
      <span className="text-base">{label}</span>
    </label>
  )
}

function TeacherSections({
  values,
  errs,
  subjectsOther,
  setSubjectsOther,
  topicsOther,
  setTopicsOther,
  hasBudget,
  setHasBudget,
}: {
  values?: SubmittedValues
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
        defaultSelected={values?.grades}
        error={errs['responses.grades']}
      />

      <CheckboxQuestion
        name="subjects"
        legend="What subject(s) do you primarily teach?"
        options={SUBJECT_OPTIONS}
        required
        otherValue="Other"
        onOtherToggle={setSubjectsOther}
        defaultSelected={values?.subjects}
        error={errs['responses.subjects']}
      >
        {subjectsOther && (
          <SpecifyInput
            name="subjectsOther"
            placeholder="Please specify"
            defaultValue={values?.subjectsOther}
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
        defaultSelected={values?.topics}
        error={errs['responses.topics']}
      >
        {topicsOther && (
          <SpecifyInput
            name="topicsOther"
            placeholder="Please specify"
            defaultValue={values?.topicsOther}
            error={errs['responses.topicsOther']}
          />
        )}
      </CheckboxQuestion>

      <RadioQuestion
        name="format"
        legend="What format would work best for your class?"
        options={FORMAT_OPTIONS}
        required
        defaultValue={values?.format}
        error={errs['responses.format']}
      />

      <RadioQuestion
        name="programDuration"
        legend="What's an ideal program duration?"
        options={PROGRAM_DURATION_OPTIONS}
        required
        defaultValue={values?.programDuration}
        error={errs['responses.programDuration']}
      />

      <CheckboxQuestion
        name="season"
        legend="Which time(s) of year would work?"
        options={SEASON_OPTIONS}
        required
        defaultSelected={values?.season}
        error={errs['responses.season']}
      />

      <RadioQuestion
        name="groupSize"
        legend="Approximately how many students would be in your group?"
        options={GROUP_SIZE_OPTIONS}
        required
        defaultValue={values?.groupSize}
        error={errs['responses.groupSize']}
      />

      <fieldset className={groupClass}>
        <legend className={legendClass}>
          Do you have a budget for field trips?
          <span className={requiredHintClass}>Required</span>
        </legend>
        <div className="space-y-1 pt-1">
          <YesNoRadios
            name="hasBudget"
            onChange={setHasBudget}
            defaultValue={values?.hasBudget}
          />
        </div>
        {errs['responses.hasBudget'] && (
          <p className={errorTextClass}>{errs['responses.hasBudget'][0]}</p>
        )}
        {hasBudget === true && (
          <div className="mt-4 ml-6 border-l-2 border-brand-dark-blue/40 pl-4">
            <RadioQuestion
              name="budgetRange"
              legend="What's your typical expense per student?"
              options={BUDGET_RANGE_OPTIONS}
              required
              defaultValue={values?.budgetRange}
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
          <YesNoRadios name="hasFieldTripped" defaultValue={values?.hasFieldTripped} />
        </div>
        {errs['responses.hasFieldTripped'] && (
          <p className={errorTextClass}>{errs['responses.hasFieldTripped'][0]}</p>
        )}
      </fieldset>

      <RadioQuestion
        name="travelTime"
        legend="What's a reasonable travel time for a class visit (each way)?"
        options={TRAVEL_TIME_OPTIONS}
        required
        defaultValue={values?.travelTime}
        error={errs['responses.travelTime']}
      />

      <TextareaQuestion
        name="curricularTieIns"
        legend="Which curricular units or standards could a garden visit support? (e.g., plant biology, nutrition, food systems, ecology)"
        defaultValue={values?.curricularTieIns}
      />

      <TextareaQuestion
        name="priorityTieIns"
        legend="How might a garden visit connect to broader priorities at your school or district? (e.g., food security awareness, community service, equity, social-emotional learning)"
        defaultValue={values?.priorityTieIns}
      />

      <TextareaQuestion
        name="perfectVisit"
        legend="If you could design the perfect garden visit for your students, what would it look like?"
        defaultValue={values?.perfectVisit}
      />

      <TextareaQuestion
        name="anythingElse"
        legend="Anything else we should know?"
        defaultValue={values?.anythingElse}
      />
    </div>
  )
}

function FamilySections({
  values,
  errs,
  topicsOther,
  setTopicsOther,
}: {
  values?: SubmittedValues
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
        defaultSelected={values?.childGrades}
        error={errs['responses.childGrades']}
      />

      <CheckboxQuestion
        name="topics"
        legend="Which topics would you most want your child(ren) to learn about?"
        options={FAMILY_TOPIC_OPTIONS}
        required
        otherValue="Other"
        onOtherToggle={setTopicsOther}
        defaultSelected={values?.topics}
        error={errs['responses.topics']}
      >
        {topicsOther && (
          <SpecifyInput
            name="topicsOther"
            placeholder="Please specify"
            defaultValue={values?.topicsOther}
            error={errs['responses.topicsOther']}
          />
        )}
      </CheckboxQuestion>

      <RadioQuestion
        name="participation"
        legend="How would you most likely participate?"
        options={PARTICIPATION_OPTIONS}
        required
        defaultValue={values?.participation}
        error={errs['responses.participation']}
      />

      <RadioQuestion
        name="programDuration"
        legend="What's an ideal program duration?"
        options={PROGRAM_DURATION_OPTIONS}
        required
        defaultValue={values?.programDuration}
        error={errs['responses.programDuration']}
      />

      <CheckboxQuestion
        name="season"
        legend="Which time(s) of year would work for your family?"
        options={SEASON_OPTIONS}
        required
        defaultSelected={values?.season}
        error={errs['responses.season']}
      />

      <RadioQuestion
        name="travelTime"
        legend="What's a reasonable travel time for a visit (each way)?"
        options={TRAVEL_TIME_OPTIONS}
        required
        defaultValue={values?.travelTime}
        error={errs['responses.travelTime']}
      />

      <TextareaQuestion
        name="perfectExperience"
        legend="If you could design the perfect garden experience for your child(ren), what would it look like?"
        defaultValue={values?.perfectExperience}
      />

      <TextareaQuestion
        name="anythingElse"
        legend="Anything else we should know?"
        defaultValue={values?.anythingElse}
      />
    </div>
  )
}

function ContactSection({
  role,
  errs,
  values,
}: {
  role: Role
  errs: FieldErrors
  values?: SubmittedValues
}) {
  return (
    <fieldset className={`${groupClass} pt-4 border-t border-zinc-200`}>
      <legend className={legendClass}>
        Want updates as the program takes shape?
        <span className={requiredHintClass}>Optional — leave blank to submit anonymously</span>
      </legend>
      <div className="space-y-3 pt-2">
        <LabeledText name="contactName" label="Name" defaultValue={values?.contactName} />
        <LabeledText
          name="contactEmail"
          label="Email"
          type="email"
          defaultValue={values?.contactEmail}
          error={errs['contact.email']}
        />
        {role === 'teacher' && (
          <LabeledText
            name="contactSchool"
            label="School"
            defaultValue={values?.contactSchool}
          />
        )}
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
  defaultSelected,
  error,
  children,
}: {
  name: string
  legend: string
  options: readonly string[]
  required?: boolean
  otherValue?: string
  onOtherToggle?: (checked: boolean) => void
  defaultSelected?: readonly string[]
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
              defaultChecked={defaultSelected?.includes(opt)}
              className="mt-0.5 h-4 w-4 accent-brand-dark-blue"
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
  defaultValue,
  error,
  dense,
}: {
  name: string
  legend: string
  options: readonly string[]
  required?: boolean
  defaultValue?: string
  error?: string[]
  dense?: boolean
}) {
  return (
    <fieldset className={groupClass}>
      <legend className={dense ? 'text-sm font-medium text-zinc-800' : legendClass}>
        {legend}
        {required && !dense && <span className={requiredHintClass}>Required</span>}
      </legend>
      <div className="space-y-1 pt-1">
        {options.map((opt) => (
          <label key={opt} className={optionRowClass}>
            <input
              type="radio"
              name={name}
              value={opt}
              defaultChecked={defaultValue === opt}
              className="mt-0.5 h-4 w-4 accent-brand-dark-blue"
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
  defaultValue,
}: {
  name: string
  onChange?: (val: boolean) => void
  defaultValue?: string
}) {
  return (
    <>
      {(['Yes', 'No'] as const).map((v) => (
        <label key={v} className={optionRowClass}>
          <input
            type="radio"
            name={name}
            value={v}
            defaultChecked={defaultValue === v}
            className="mt-0.5 h-4 w-4 accent-brand-dark-blue"
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
  defaultValue,
  error,
}: {
  name: string
  placeholder?: string
  defaultValue?: string
  error?: string[]
}) {
  return (
    <div className="ml-7 mt-2">
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        maxLength={200}
        className={inputClass}
      />
      {error && <p className={errorTextClass}>{error[0]}</p>}
    </div>
  )
}

function TextareaQuestion({
  name,
  legend,
  defaultValue,
}: {
  name: string
  legend: string
  defaultValue?: string
}) {
  return (
    <fieldset className={groupClass}>
      <legend className={legendClass}>
        {legend}
        <span className={requiredHintClass}>Optional</span>
      </legend>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ''}
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
  defaultValue,
  error,
}: {
  name: string
  label: string
  type?: string
  defaultValue?: string
  error?: string[]
}) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-700">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
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
