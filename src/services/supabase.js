import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to check if credentials are configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here'
  )
}

// Instantiate Supabase client. Fallback to placeholder to prevent runtime crashes.
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-ref.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key'
)

/**
 * Creates a secondary Supabase client instance with persistSession: false.
 * This is used by the Super Admin to create new admins (via signup) 
 * without overriding or destroying their own logged-in session.
 */
export const createAdminHelperClient = () => {
  return createClient(
    isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-ref.supabase.co',
    isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
