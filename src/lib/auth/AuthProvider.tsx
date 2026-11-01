import type { Session } from '@supabase/supabase-js'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../supabase'
import { AuthContext, type SignUpResult } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => {
    const signIn = async (email: string, password: string) => {
      if (!supabase) return { error: 'Supabase is not configured yet.' }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? error.message : null }
    }

    const signUp = async (email: string, password: string): Promise<SignUpResult> => {
      if (!supabase) return { error: 'Supabase is not configured yet.', needsConfirmation: false }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message, needsConfirmation: false }
      return { error: null, needsConfirmation: !data.session }
    }

    const signOut = async () => {
      if (!supabase) return
      await supabase.auth.signOut()
    }

    return {
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }
  }, [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
