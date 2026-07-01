'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Student = {
  id: number
  full_name: string
  type: string
  batch: string
  gender: string
}

type DepartureRecord = {
  student_id: number
  status: string
  notes: string | null
}

type ExistingAttendance = {
  student_id: number
  status: string
}

type Props = {
  students: Student[]
  teacherId: string
  subject: string
  departureRecords: DepartureRecord[]
  existingAttendance: ExistingAttendance[]
  today: string
}

const EXCUSED_STATUSES = ['sick_ill', 'specific_reason']

const WARDEN_STATUS_LABELS: Record<string, string> = {
  left_for_class: 'Left for Class',
  sick_ill: 'Sick / Ill',
  specific_reason: 'Specific Reason',
  no_uniform_laundry: 'No Uniform — Laundry',
  no_uniform_shoes: 'No Uniform — Shoes',
  no_uniform_other: 'No Uniform — Other',
}

export default function AttendanceForm({
  students,
  teacherId,
  subject,
  departureRecords,
  existingAttendance,
  today,
}: Props) {
  const supabase = createClient()

  // Build lookup maps
  const departureMap = Object.fromEntries(
    departureRecords.map(r => [r.student_id, r])
  )
  const existingMap = Object.fromEntries(
    existingAttendance.map(r => [r.student_id, r.status])
  )

  // Auto-set status for excused students
  const initialSelections: Record<number, string> = {}
  students.forEach(student => {
    if (existingMap[student.id]) {
      initialSelections[student.id] = existingMap[student.id]
    } else {
      const departure = departureMap[student.id]
      if (departure && EXCUSED_STATUSES.includes(departure.status)) {
        initialSelections[student.id] = 'absent'
      }
    }
  })

  const [selections, setSelections] = useState<Record<number, string>>(initialSelections)
  const [submitted, setSubmitted] = useState<Record<number, boolean>>(
    Object.fromEntries(existingAttendance.map(r => [r.student_id, true]))
  )
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})

  const handleSubmit = async (student: Student) => {
    const status = selections[student.id]
    if (!status) {
      setErrors(prev => ({ ...prev, [student.id]: 'Please select a status first.' }))
      return
    }

    setLoading(prev => ({ ...prev, [student.id]: true }))
    setErrors(prev => ({ ...prev, [student.id]: '' }))

    const { error } = await supabase.from('attendance_records').insert({
      student_id: student.id,
      teacher_id: teacherId,
      program: subject,
      status,
      date: today,
    })

    setLoading(prev => ({ ...prev, [student.id]: false }))

    if (error) {
      setErrors(prev => ({ ...prev, [student.id]: error.message }))
    } else {
      setSubmitted(prev => ({ ...prev, [student.id]: true }))
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {students.map(student => {
        const departure = departureMap[student.id]
        const isExcused = departure && EXCUSED_STATUSES.includes(departure.status)
        const isAutoAbsent = isExcused && !existingMap[student.id]

        return (
          <div key={student.id} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-slate-900">{student.full_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {student.batch} —{' '}
                  <span className={student.type === 'hostler' ? 'text-blue-600' : 'text-slate-400'}>
                    {student.type === 'hostler' ? 'Hostler' : 'Day Scholar'}
                  </span>
                </p>

                {/* Warden status badge */}
                {student.type === 'hostler' && (
                  <p className="text-xs mt-1">
                    {departure ? (
                      <span className={`font-medium ${
                        departure.status === 'left_for_class'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}>
                        Warden: {WARDEN_STATUS_LABELS[departure.status] ?? departure.status}
                        {departure.notes ? ` — ${departure.notes}` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Warden: Not marked yet</span>
                    )}
                  </p>
                )}

                {student.type === 'day_scholar' && (
                  <p className="text-xs text-slate-400 mt-1 italic">Day Scholar — no warden record</p>
                )}
              </div>

              {submitted[student.id] && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  selections[student.id] === 'present'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-red-600 bg-red-50'
                }`}>
                  {selections[student.id] === 'present' ? '✓ Present' : '✗ Absent'}
                </span>
              )}
            </div>

            {isAutoAbsent && !submitted[student.id] && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-2">
                Auto-marked Absent — warden status: {WARDEN_STATUS_LABELS[departure.status]}. You can override below.
              </p>
            )}

            {!submitted[student.id] ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelections(prev => ({ ...prev, [student.id]: 'present' }))}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-all ${
                      selections[student.id] === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setSelections(prev => ({ ...prev, [student.id]: 'absent' }))}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-all ${
                      selections[student.id] === 'absent'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-red-400'
                    }`}
                  >
                    Absent
                  </button>
                </div>

                {errors[student.id] && (
                  <p className="text-xs text-red-500">{errors[student.id]}</p>
                )}

                <button
                  onClick={() => handleSubmit(student)}
                  disabled={loading[student.id]}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-sm font-semibold py-2 rounded-lg transition-all"
                >
                  {loading[student.id] ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Attendance recorded for today.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}