import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isConfigured: false,
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured] = useState(isSupabaseConfigured())

  // Fetch admin profile from public.admins table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching admin profile:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('Error in fetchProfile:', err)
      return null
    }
  }

  useEffect(() => {
    if (!isConfigured) {
      const mockUser = localStorage.getItem('kbc_mock_user')
      if (mockUser) {
        const parsed = JSON.parse(mockUser)
        setUser({ id: parsed.id, email: parsed.email })
        setProfile(parsed)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
      return
    }

    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          setProfile(prof)
        }
      } catch (err) {
        console.error('Failed to restore session:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        setProfile(prof)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [isConfigured])

  // Login handler
  const login = async (email, password) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  // Logout handler
  const logout = async () => {
    if (!isConfigured) {
      localStorage.removeItem('kbc_mock_user')
      setUser(null)
      setProfile(null)
      window.location.href = '/login'
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Logout error:', error.message)
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    isConfigured,
    isSuperAdmin: profile?.role === 'super_admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
