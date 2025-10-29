import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export type { User }

export interface SignUpCredentials {
  email: string
  password: string
  displayName?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, displayName }: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn({ email, password }: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Sign in an existing user with email and password, with remember me option
 */
export async function signInWithEmail(
  email: string, 
  password: string,
  rememberMe: boolean = true
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Store remember me preference (optional - for UI state)
  if (typeof window !== 'undefined') {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
  }
  
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current session and access token
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get the access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.access_token || null
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}

/**
 * Get user display name or fallback to email
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return 'G';
  const displayName = getUserDisplayName(user);
  const parts = displayName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase();
}
