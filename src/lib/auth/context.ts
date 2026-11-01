import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface SignUpResult {
  error: string | null
  needsConfirmation: boolean
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
