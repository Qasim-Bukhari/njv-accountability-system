export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded">Super Admin</span>
        <h1 className="text-3xl font-bold text-slate-950 mt-2">NJV Transit Control Center</h1>
        <p className="text-slate-600 mt-1">Weekend 01 Placeholder — 15-minute critical alert logs live here.</p>
        <div className="mt-6 h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
          Real-time Transit Alert Monitoring Stream...
        </div>
      </div>
    </div>
  )
}