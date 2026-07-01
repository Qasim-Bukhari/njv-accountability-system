import { login } from './actions'

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  // Await searchParams as required in newer Next.js versions
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NJV Accountability System
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sign in to access your dashboard portal
          </p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center font-medium animate-fade-in">
            {decodeURIComponent(error.replace(/\+/g, ' '))}
          </div>
        )}

        {/* Login Form */}
        <form action={login} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@njv.edu.pk"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm mt-2"
          >
            Sign In
          </button>
        </form>

      </div>
    </div>
  )
}