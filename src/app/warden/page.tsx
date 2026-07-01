import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DepartureForm from './DepartureForm'

export default async function WardenDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: assignments, error: assignmentError } = await supabase
    .from('warden_assignments')
    .select('batch')
    .eq('warden_id', user.id)

  if (assignmentError || !assignments || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-500">No batch assigned to this warden account.</p>
      </div>
    )
  }

  const batches = assignments.map(a => a.batch)

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, full_name, type, batch, gender')
    .in('batch', batches)
    .order('full_name')

  if (studentsError) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-500">Failed to load students: {studentsError.message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          Warden Portal
        </span>
        <h1 className="text-3xl font-bold text-slate-950 mt-2">NJV Hostel Departure Logs</h1>
        <p className="text-slate-600 mt-1">Batch: {batches.join(', ')}</p>
        <DepartureForm students={students ?? []} wardenId={user.id} />
      </div>
    </div>
  )
}