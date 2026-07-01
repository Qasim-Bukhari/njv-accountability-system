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

type Props = {
  students: Student[]
  wardenId: string
}

const STATUS_OPTIONS = [
  { value: 'left_for_class', label: 'Left for Class' },
  { value: 'sick_ill', label: 'Sick / Ill' },
  { value: 'specific_reason', label: 'Specific Reason' },
  { value: 'no_uniform_laundry', label: 'No Uniform — Laundry' },
  { value: 'no_uniform_shoes', label: 'No Uniform — Shoes' },
  { value: 'no_uniform_other', label: 'No Uniform — Other' },
]

export default function DepartureForm({ students, wardenId }: Props) {
  const supabase = createClient()

  const [selections, setSelections] = useState<Record<number, string>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
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

    const { error } = await supabase.from('departure_records').insert({
      student_id: student.id,
      warden_id: wardenId,
      status,
      notes: notes[student.id] || null,
      timer_start: new Date().toISOString(),
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
      {students.map(student => (
        <div
          key={student.id}
          className="p-4 border border-slate-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium text-slate-900">{student.full_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {student.batch} —{' '}
                <span className={student.type === 'hostler' ? 'text-blue-600' : 'text-slate-400'}>
                  {student.type === 'hostler' ? 'Hostler' : 'Day Scholar'}
                </span>
              </p>
            </div>

            {submitted[student.id] && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                ✓ Logged
              </span>
            )}
          </div>

          {!submitted[student.id] ? (
            <div className="space-y-2">
              <select
                value={selections[student.id] || ''}
                onChange={e =>
                  setSelections(prev => ({ ...prev, [student.id]: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">— Select departure status —</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {selections[student.id] === 'specific_reason' && (
                <input
                  type="text"
                  placeholder="Enter reason..."
                  value={notes[student.id] || ''}
                  onChange={e =>
                    setNotes(prev => ({ ...prev, [student.id]: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                />
              )}

              {errors[student.id] && (
                <p className="text-xs text-red-500">{errors[student.id]}</p>
              )}

              <button
                onClick={() => handleSubmit(student)}
                disabled={loading[student.id]}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-sm font-semibold py-2 rounded-lg transition-all"
              >
                {loading[student.id] ? 'Logging...' : 'Log Departure'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Status logged — {STATUS_OPTIONS.find(o => o.value === selections[student.id])?.label}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}