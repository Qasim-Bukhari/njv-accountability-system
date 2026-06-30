export default function WardenDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Warden Portal</span>
        <h1 className="text-3xl font-bold text-slate-950 mt-2">NJV Hostel Departure Logs</h1>
        <p className="text-slate-600 mt-1">Weekend 01 Placeholder — Real-time student roster will load here.</p>
        <div className="mt-6 h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
          Roster Tracking Grid Loading Next Weekend...
        </div>
      </div>
    </div>
  )
}