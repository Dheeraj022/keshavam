import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Database, User, ShieldCheck, KeyRound, ArrowLeft, LogIn } from 'lucide-react'
import { showToast } from '../components/Toast'
import BrandLogo from '../components/BrandLogo'

const Login = () => {
  const { login, isConfigured } = useAuth()
  const navigate = useNavigate()

  // View state: toggle between 'login' and 'register'
  const [isRegistering, setIsRegistering] = useState(false)

  // Login Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Register Form states
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('bronze')
  const [passkey, setPasskey] = useState('')

  const [loading, setLoading] = useState(false)

  // Handle Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast.error('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      if (isConfigured) {
        await login(email, password)
        showToast.success('Welcome back, Admin!')
        navigate('/dashboard')
      } else {
        // Local Sandbox Auth Bypass
        const mockUser = localStorage.getItem('kbc_mock_user')
        if (mockUser) {
          const parsed = JSON.parse(mockUser)
          if (parsed.email.toLowerCase() === email.toLowerCase()) {
            showToast.success('Logged in to Local Demo mode!')
            navigate('/dashboard')
            setLoading(false)
            return
          }
        }

        // Check if user matches any admin in local mock list
        const list = JSON.parse(localStorage.getItem('kbc_mock_admins') || '[]')
        const match = list.find(a => a.email.toLowerCase() === email.toLowerCase())
        if (match) {
          localStorage.setItem('kbc_mock_user', JSON.stringify(match))
          showToast.success(`Logged in as ${match.role.toUpperCase()} (Demo Mode)`)
          navigate('/dashboard')
          window.location.reload()
        } else {
          // Default fallback mock
          const defaultAdmin = { id: 'mock-sa-id', email: 'admin@keshavam.com', name: 'Keshav Sharma', role: 'super_admin' }
          localStorage.setItem('kbc_mock_user', JSON.stringify(defaultAdmin))
          showToast.success('Logged in as Default Super Admin (Demo Mode)!')
          navigate('/dashboard')
          window.location.reload()
        }
      }
    } catch (err) {
      console.error(err)
      showToast.error(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Admin registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword || !passkey) {
      showToast.error('Please fill in all registration fields.')
      return
    }

    // Verify Passkey constraint
    if (passkey !== 'AT2026WEB') {
      showToast.error('Access Denied. Secure registration passkey is incorrect.')
      return
    }

    if (regPassword.length < 6) {
      showToast.error('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (isConfigured) {
        // Standard user signup on Supabase
        const { data, error } = await supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
          options: {
            data: {
              name: regName,
              role: regRole,
            }
          }
        })

        if (error) throw error

        showToast.success('Administrator registered successfully!')
        setIsRegistering(false)
        setEmail(regEmail)
        setPassword(regPassword)
      } else {
        // Local Storage Sandbox Registration
        const list = JSON.parse(localStorage.getItem('kbc_mock_admins') || '[]')
        if (list.some(a => a.email.toLowerCase() === regEmail.toLowerCase())) {
          throw new Error('An administrator with this email already exists.')
        }

        const added = {
          id: `mock-id-${Date.now()}`,
          name: regName,
          email: regEmail,
          role: regRole,
          created_at: new Date().toISOString()
        }

        localStorage.setItem('kbc_mock_admins', JSON.stringify([added, ...list]))
        showToast.success('Demo Admin account created! Switch back to log in.')
        setIsRegistering(false)
        setEmail(regEmail)
        setPassword(regPassword)
      }
    } catch (err) {
      console.error(err)
      showToast.error(err.message || 'Failed to create administrator account.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Demo Mode quick login
  const handleBypassDemo = async (role = 'super_admin') => {
    setLoading(true)
    const mockProfiles = {
      super_admin: { id: 'mock-sa-id', email: 'admin@keshavam.com', name: 'Keshav Sharma', role: 'super_admin' },
      platinum: { id: 'mock-plt-id', email: 'platinum@keshavam.com', name: 'Rajesh Kumar', role: 'platinum' },
      gold: { id: 'mock-gld-id', email: 'gold@keshavam.com', name: 'Amit Singh', role: 'gold' },
    }
    
    localStorage.setItem('kbc_mock_user', JSON.stringify(mockProfiles[role]))
    showToast.success(`Logged in as ${role.toUpperCase()} (Demo Mode)`)
    setLoading(false)
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen w-screen flex bg-luxury-bg relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-luxury-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-luxury-gold/5 blur-3xl pointer-events-none" />

      {/* Main Split Container */}
      <div className="w-full flex flex-col md:flex-row p-4 md:p-6 lg:p-8 relative z-10 gap-6">
        
        {/* Left Column: Input Form (50% Width) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-8 lg:px-12 py-8 bg-luxury-bg-sec/45 rounded-2xl border border-white/5 shadow-2xl glass-panel relative">
          
          {/* Top Gold Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-luxury-gold/20 via-luxury-gold to-luxury-gold/20" />

          {/* Logo and Branding */}
          <div className="mb-8">
            <BrandLogo size="lg" />
          </div>

          {/* Header Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide uppercase">
              {!isRegistering ? 'Holla, Welcome Back' : 'Create Admin Account'}
            </h2>
            <p className="text-xs text-luxury-gray mt-1 font-sans">
              {!isRegistering 
                ? 'Hey, welcome back to your check-in checkpoint terminal' 
                : 'Fill in credentials and register a new event staff member'
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isRegistering ? (
              /* Login Form */
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-luxury-gray font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@keshavam.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm font-sans focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-luxury-gray font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm font-sans focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-luxury-gray cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/10 bg-luxury-card text-luxury-gold focus:ring-0 cursor-pointer" 
                      />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => showToast.error('Please contact system administrator to reset password.')}
                      className="text-luxury-gold hover:text-luxury-gold-light transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-4 bg-luxury-gold hover:bg-luxury-gold-light hover:shadow-lg text-luxury-bg font-serif font-bold uppercase tracking-widest text-xs rounded-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2 border border-luxury-gold"
                  >
                    {loading ? <span>Authenticating...</span> : <span>Sign In</span>}
                  </button>
                </form>

                {/* Toggle to register */}
                <div className="mt-6 text-center">
                  <span className="text-xs text-luxury-gray">Don't have an account? </span>
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-xs text-luxury-gold hover:text-luxury-gold-light font-semibold tracking-wide transition-colors focus:outline-none"
                  >
                    Sign Up
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Registration Form */
              <motion.div
                key="register-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold">
                      Staff Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-luxury-gold/65">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="E.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs font-sans focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-luxury-gold/65">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="ramesh@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs font-sans focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-luxury-gold/65">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs font-sans focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold block">
                        Gate / Role
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-luxury-gold/65">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value)}
                          className="w-full pl-9 pr-2 py-2 rounded-lg glass-input text-[11px] appearance-none cursor-pointer focus:outline-none focus:border-luxury-gold"
                        >
                          <option value="super_admin" className="bg-luxury-bg">Super Admin</option>
                          <option value="platinum" className="bg-luxury-bg">Platinum Gate</option>
                          <option value="gold" className="bg-luxury-bg">Gold Gate</option>
                          <option value="silver" className="bg-luxury-bg">Silver Gate</option>
                          <option value="bronze" className="bg-luxury-bg">Bronze Gate</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold block">
                        Security Passkey
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-luxury-gold/65">
                          <KeyRound className="w-4 h-4" />
                        </span>
                        <input
                          type="password"
                          required
                          value={passkey}
                          onChange={(e) => setPasskey(e.target.value)}
                          placeholder="Passkey"
                          className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs font-sans focus:border-luxury-gold"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-4 bg-luxury-gold hover:bg-luxury-gold-light hover:shadow-lg text-luxury-bg font-serif font-bold uppercase tracking-widest text-xs rounded-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2 border border-luxury-gold"
                  >
                    {loading ? <span>Creating Account...</span> : <span>Register</span>}
                  </button>
                </form>

                {/* Toggle to login */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="text-xs text-luxury-gold hover:text-luxury-gold-light tracking-wide transition-colors focus:outline-none flex items-center justify-center mx-auto space-x-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Local Demo Bypass Section */}
          {!isConfigured && (
            <div className="mt-6 pt-4 border-t border-luxury-gold/15 text-center">
              <div className="flex items-center justify-center space-x-2 text-[10px] text-luxury-gold-light mb-2">
                <Database className="w-3 h-3 text-luxury-gold" />
                <span className="font-serif uppercase tracking-wider font-semibold">Demo Sandbox Mode</span>
              </div>
              <div className="flex flex-col space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleBypassDemo('super_admin')}
                  className="w-full py-1.5 bg-luxury-card/50 hover:bg-luxury-card border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold-light hover:text-luxury-gold text-[10px] uppercase tracking-wider rounded transition-colors"
                >
                  Access as Super Admin
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBypassDemo('platinum')}
                    className="py-1 bg-luxury-card/30 hover:bg-luxury-card border border-white/5 hover:border-white/20 text-white text-[9px] uppercase tracking-wider rounded transition-colors"
                  >
                    Platinum Gate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBypassDemo('gold')}
                    className="py-1 bg-luxury-card/30 hover:bg-luxury-card border border-white/5 hover:border-white/20 text-white text-[9px] uppercase tracking-wider rounded transition-colors"
                  >
                    Gold Gate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Premium Banner Card (50% Width) */}
        <div className="hidden md:flex md:w-1/2 rounded-2xl overflow-hidden relative border border-luxury-gold/25 shadow-2xl shadow-luxury-gold/10 min-h-[500px]">
          {/* Lord Krishna Image background */}
          <img 
            src="/k.jpg" 
            alt="Divine Lord Krishna" 
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 hover:scale-105 transition-transform duration-[6000ms] ease-out"
          />
          
          {/* Subtle gradient overlay to darken bottom for typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg/95 via-luxury-bg/35 to-transparent" />
          
          {/* Divine Quote Floating Glassmorphic Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute bottom-8 left-8 right-8 glass-panel-heavy p-6 rounded-xl border border-luxury-gold/30 text-center shadow-2xl shadow-black/80"
          >
            <p className="font-serif italic text-luxury-gold-light text-sm lg:text-base tracking-wide leading-relaxed">
              "Experience the Divine Bliss of Devotion and Music."
            </p>
            <p className="text-[10px] tracking-[0.3em] text-white/60 uppercase mt-3 font-sans font-bold">
              Atakshi Event Management - Moradabad
            </p>
            <div className="w-16 h-[1px] bg-luxury-gold/40 mx-auto mt-4" />
          </motion.div>
        </div>

      </div>
    </div>
  )
}

export default Login
