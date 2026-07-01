import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AttendanceForm from './AttendanceForm'

export default async function TeacherDashboard() {
  const supabase = await createClient()

  // 1. Get logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get teacher's assigned subjects and batches
  const { data: assignments, error: assignmentError } = await supabase
    .from('teacher_assignments')
    .select('subject, batch')
    .eq('teacher_id', user.id)

  if (assignmentError || !assignments || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-500">No subjects assigned to this teacher account.</p>
      </div>
    )
  }

  // 3. Get enrolled students for teacher's subjects
  const { data: enrollments, error: enrollmentError } = await supabase
    .from('student_enrollments')
    .select('student_id, subject, batch')
    .in('subject', assignments.map(a => a.subject))
    .in('batch', assignments.map(a => a.batch))

  if (enrollmentError || !enrollments || enrollments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-500">No students enrolled in your subjects.</p>
      </div>
    )
  }

  // 4. Fetch student details
  const studentIds = enrollments.map(e => e.student_id)

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, full_name, type, batch, gender')
    .in('id', studentIds)
    .order('full_name')

  if (studentsError) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-500">Failed to load students: {studentsError.message}</p>
      </div>
    )
  }

  // 5. Fetch today's departure records for hostler students
  const today = new Date().toISOString().split('T')[0]

  const { data: departureRecords } = await supabase
    .from('departure_records')
    .select('student_id, status, notes')
    .in('student_id', studentIds)
    .gte('timer_start', `${today}T00:00:00Z`)
    .lte('timer_start', `${today}T23:59:59Z`)

  // 6. Fetch today's existing attendance records to prevent duplicates
  const { data: existingAttendance } = await supabase
    .from('attendance_records')
    .select('student_id, status')
    .eq('teacher_id', user.id)
    .eq('date', today)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          Teacher Portal
        </span>
        <h1 className="text-3xl font-bold text-slate-950 mt-2">NJV Classroom Attendance</h1>
        <p className="text-slate-600 mt-1">
          {assignments.map(a => `${a.subject} — ${a.batch}`).join(', ')}
        </p>
        <AttendanceForm
          students={students ?? []}
          teacherId={user.id}
          subject={assignments[0].subject}
          departureRecords={departureRecords ?? []}
          existingAttendance={existingAttendance ?? []}
          today={today}
        />
      </div>
    </div>
  )
}