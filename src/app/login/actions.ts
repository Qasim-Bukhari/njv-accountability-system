'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Immediate validation
  if (!email || !password) {
    return redirect('/login?error=Missing+email+or+password')
  }

  // 2. Authenticate user with Supabase Auth (Outside try/catch)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    const errorMessage = authError?.message || 'Authentication failed'
    return redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  // 3. Database lookup for roles (Inside isolated try/catch)
  let profileRole = null

  try {
    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      return redirect('/login?error=Staff+profile+not+found')
    }

    profileRole = profile.role
  } catch (dbError) {
    console.error('Database connection exception:', dbError)
    return redirect('/login?error=Database+profile+lookup+failed')
  }

  // 4. Clean routing map execution
  if (profileRole === 'warden') {
    return redirect('/warden')
  } else if (profileRole === 'teacher') {
    return redirect('/teacher')
  } else if (profileRole === 'super_admin') {
    return redirect('/admin')
  }

  return redirect('/login?error=Invalid+user+role')
}