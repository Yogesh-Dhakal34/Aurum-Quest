import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type PolicyConsent = {
  acceptedPolicyVersion: string
  acceptedPolicyAt: string
}

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  /** True after the user opens a password reset email link. */
  isRecovering: boolean
  finishRecovery: () => void
  signUp: (
    email: string,
    password: string,
    consent: PolicyConsent,
  ) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)