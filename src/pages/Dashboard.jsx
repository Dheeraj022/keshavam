import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSound } from '../context/SoundContext'
import { supabase } from '../services/supabase'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import { showToast } from '../components/Toast'
import { 
  CheckCircle, 
  XCircle, 
  Ticket, 
  Percent, 
  ArrowRight, 
  Zap, 
  Lock, 
  History, 
  Smartphone,
  Check,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'

// Sound fallback synthesized directly
const playBuzzer = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch (e) {}
}

const Dashboard = () => {
  const { profile, isConfigured } = useAuth()
  const { playSuccess, playFailure } = useSound()

  // States
  const [stats, setStats] = useState({ total: 1800, checkedIn: 0, remaining: 1800, rate: 0 })
  const [categoryStats, setCategoryStats] = useState({ platinum: 0, gold: 0, silver: 0, bronze: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [ticketInput, setTicketInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(true)

  // Scan Result State
  const [scanResult, setScanResult] = useState(null) // { success: boolean, message: string, code: string, details?: any }

  // Refs
  const inputRef = useRef(null)

  // Local Storage Mock DB helpers for Demo mode
  const getLocalTickets = () => {
    const raw = localStorage.getItem('kbc_mock_tickets')
    if (raw) return JSON.parse(raw)
    
    // Seed 1,800 tickets
    const tickets = []
    const categories = ['platinum', 'gold', 'silver', 'bronze']
    const prefixes = { platinum: 'PLT', gold: 'GLD', silver: 'SLR', bronze: 'BRZ' }

    categories.forEach(cat => {
      for (let i = 1; i <= 450; i++) {
        tickets.push({
          ticket_code: `${prefixes[cat]}${String(i).padStart(3, '0')}`,
          category: cat,
          checked_in: false,
          checked_in_at: null,
          checked_in_by_name: null
        })
      }
    })
    
    localStorage.setItem('kbc_mock_tickets', JSON.stringify(tickets))
    return tickets
  }

  const saveLocalTickets = (tickets) => {
    localStorage.setItem('kbc_mock_tickets', JSON.stringify(tickets))
  }

  // Load stats and activity
  const loadSystemData = async () => {
    try {
      if (isConfigured) {
        const userRole = profile?.role

        // 1. Fetch parallel counts to bypass the server-side PostgREST 1000 row limit
        const [totalRes, checkedRes, platRes, goldRes, silvRes, bronRes] = await Promise.all([
          supabase.from('tickets').select('id', { count: 'exact', head: true }),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('checked_in', true),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('category', 'platinum').eq('checked_in', true),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('category', 'gold').eq('checked_in', true),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('category', 'silver').eq('checked_in', true),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('category', 'bronze').eq('checked_in', true)
        ])

        if (totalRes.error) throw totalRes.error
        if (checkedRes.error) throw checkedRes.error

        const total = totalRes.count || 0
        const checkedIn = checkedRes.count || 0
        const remaining = total - checkedIn
        const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0

        setStats({ total, checkedIn, remaining, rate })

        if (userRole === 'super_admin') {
          setCategoryStats({
            platinum: platRes.count || 0,
            gold: goldRes.count || 0,
            silver: silvRes.count || 0,
            bronze: bronRes.count || 0
          })
        }

        // 2. Fetch recent activity (checked in tickets)
        const { data: recent, error: recentError } = await supabase
          .from('tickets')
          .select(`
            ticket_code, 
            checked_in_at, 
            checked_in, 
            admins!tickets_checked_in_by_fkey (name)
          `)
          .eq('checked_in', true)
          .order('checked_in_at', { ascending: false })
          .limit(20)

        if (recentError) throw recentError

        // Map recent activity items
        const activity = recent.map(item => ({
          code: item.ticket_code,
          time: item.checked_in_at ? format(new Date(item.checked_in_at), 'hh:mm:ss a') : 'N/A',
          admin: item.admins?.name || 'Admin',
          status: 'success'
        }))
        setRecentActivity(activity)
      } else {
        // Mock Demo mode
        const tickets = getLocalTickets()
        // Filter by role if not super_admin
        const userRole = profile?.role || 'super_admin'
        const rolePrefix = { platinum: 'PLT', gold: 'GLD', silver: 'SLR', bronze: 'BRZ' }
        
        const filteredTickets = userRole === 'super_admin' 
          ? tickets 
          : tickets.filter(t => t.category === userRole)

        const recent = tickets
          .filter(t => t.checked_in)
          .sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at))
          .slice(0, 20)

        calculateStats(filteredTickets, recent)
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      showToast.error('Failed to retrieve system status.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ticketsList, recentList) => {
    const total = ticketsList.length
    const checkedIn = ticketsList.filter(t => t.checked_in).length
    const remaining = total - checkedIn
    const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0

    setStats({ total, checkedIn, remaining, rate })

    // Calculate category breakdown
    const breakdown = { platinum: 0, gold: 0, silver: 0, bronze: 0 }
    ticketsList.forEach(t => {
      if (t.checked_in && breakdown[t.category] !== undefined) {
        breakdown[t.category]++
      }
    })
    setCategoryStats(breakdown)

    // Map recent activity items
    const activity = recentList.map(item => ({
      code: item.ticket_code,
      time: item.checked_in_at ? format(new Date(item.checked_in_at), 'hh:mm:ss a') : 'N/A',
      admin: item.admins?.name || item.checked_in_by_name || 'Admin',
      status: 'success'
    }))
    setRecentActivity(activity)
  }

  useEffect(() => {
    if (profile) {
      loadSystemData()
    }

    // Set up Supabase Realtime subscription
    let subscription
    if (isConfigured) {
      subscription = supabase
        .channel('db-changes')
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'tickets' }, 
          () => {
            loadSystemData()
          }
        )
        .subscribe()
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [profile, isConfigured])

  // Focus input helper
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    if (!loading) {
      focusInput()
    }
  }, [loading])

  // Form input validation and execution
  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    
    // Normalize code (Remove whitespace and capitalize)
    const rawCode = ticketInput.replace(/\s+/g, '').toUpperCase()
    if (!rawCode) {
      showToast.error('Please enter a ticket code.')
      return
    }

    setVerifying(true)
    setScanResult(null)

    // Extract Prefix
    const prefix = rawCode.substring(0, 3)
    const prefixMap = { PLT: 'platinum', GLD: 'gold', SLR: 'silver', BRZ: 'bronze' }
    const ticketCategory = prefixMap[prefix]

    // 1. Category validation
    if (!ticketCategory) {
      playFailure()
      setScanResult({
        success: false,
        message: '❌ INVALID TICKET CODE FORMAT',
        code: rawCode,
        details: 'Code must start with PLT, GLD, SLR, or BRZ followed by 3 digits (e.g. GLD005).'
      })
      setTicketInput('')
      setVerifying(false)
      setTimeout(focusInput, 100)
      return
    }

    // 2. Role access check
    const currentRole = profile?.role
    if (currentRole !== 'super_admin' && currentRole !== ticketCategory) {
      playFailure()
      setScanResult({
        success: false,
        message: `❌ ACCESS DENIED`,
        code: rawCode,
        details: `This ticket belongs to ${ticketCategory.toUpperCase()} Category. Your role only allows verifying ${currentRole.toUpperCase()} tickets.`
      })
      setTicketInput('')
      setVerifying(false)
      setTimeout(focusInput, 100)
      return
    }

    try {
      if (isConfigured) {
        // Query Database
        const { data: ticket, error } = await supabase
          .from('tickets')
          .select('*, admins!tickets_checked_in_by_fkey(name)')
          .eq('ticket_code', rawCode)
          .maybeSingle()

        if (error) throw error

        if (!ticket) {
          playFailure()
          setScanResult({
            success: false,
            message: '❌ TICKET NOT FOUND',
            code: rawCode,
            details: 'This code does not exist in the database. Ensure there are no typos.'
          })
        } else if (ticket.checked_in) {
          playFailure()
          const timeFormatted = format(new Date(ticket.checked_in_at), 'dd MMM yyyy, hh:mm a')
          setScanResult({
            success: false,
            message: '❌ ALREADY USED',
            code: rawCode,
            details: `Checked In At: ${timeFormatted} by ${ticket.admins?.name || 'an Admin'}`
          })
        } else {
          // Perform Check In
          const { error: updateError } = await supabase
            .from('tickets')
            .update({
              checked_in: true,
              checked_in_at: new Date().toISOString(),
              checked_in_by: profile.id
            })
            .eq('ticket_code', rawCode)

          if (updateError) throw updateError

          playSuccess()
          setScanResult({
            success: true,
            message: '✅ ENTRY APPROVED',
            code: rawCode,
            details: `Category: ${ticketCategory.toUpperCase()} - Checked In Successfully`
          })
          loadSystemData()
        }
      } else {
        // Mock LocalStorage execution
        const tickets = getLocalTickets()
        const index = tickets.findIndex(t => t.ticket_code === rawCode)

        if (index === -1) {
          playFailure()
          setScanResult({
            success: false,
            message: '❌ TICKET NOT FOUND',
            code: rawCode,
            details: 'Demo Mode: Ticket does not exist. Ensure code ranges between 001 and 450.'
          })
        } else {
          const ticket = tickets[index]
          if (ticket.checked_in) {
            playFailure()
            const timeFormatted = format(new Date(ticket.checked_in_at), 'dd MMM yyyy, hh:mm a')
            setScanResult({
              success: false,
              message: '❌ ALREADY USED',
              code: rawCode,
              details: `Checked In At: ${timeFormatted} by ${ticket.checked_in_by_name || 'Demo Admin'}`
            })
          } else {
            // Update
            ticket.checked_in = true
            ticket.checked_in_at = new Date().toISOString()
            ticket.checked_in_by_name = profile?.name || 'Super Admin'
            saveLocalTickets(tickets)

            playSuccess()
            setScanResult({
              success: true,
              message: '✅ ENTRY APPROVED',
              code: rawCode,
              details: `Category: ${ticketCategory.toUpperCase()} - Checked In Successfully (Demo)`
            })
            loadSystemData()
          }
        }
      }
    } catch (err) {
      console.error('Verification error:', err)
      showToast.error('An error occurred during verification.')
    } finally {
      setTicketInput('')
      setVerifying(false)
      // Focus back to input box after small delay
      setTimeout(focusInput, 100)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader text="Restoring temple logs..." />
      </div>
    )
  }

  // Helper stats labels
  const rolePrefix = { platinum: 'PLT', gold: 'GLD', silver: 'SLR', bronze: 'BRZ' }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-3 order-1 glass-panel p-6 rounded-xl border-l-4 border-l-luxury-gold flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-white flex items-center gap-2">
            WELCOME, <span className="gold-text-gradient uppercase">{profile?.name}</span>
          </h2>
          <p className="text-xs text-luxury-gray tracking-wider mt-1 uppercase">
            Location: Moradabad | Session Status: Active & Secured
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-luxury-gold-light/80 bg-luxury-bg-sec px-4 py-2 rounded-lg border border-luxury-gold/15">
          <Zap className="w-3.5 h-3.5 text-luxury-gold animate-pulse" />
          <span className="font-serif uppercase tracking-widest font-semibold">
            {profile?.role === 'super_admin' ? 'SYSTEM SUPERVISOR' : `${profile?.role} Checkpoint`}
          </span>
        </div>
      </motion.div>

      {/* Stats Cards Section */}
      <div className="lg:col-span-3 order-3 lg:order-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value={stats.total}
          subtext={profile?.role === 'super_admin' ? 'Event capacity' : 'Your series allowance (450)'}
          icon={Ticket}
          color="info"
          delay={0.05}
        />
        <StatCard
          title="Checked In"
          value={stats.checkedIn}
          subtext={`${stats.remaining} awaiting check-in`}
          icon={CheckCircle}
          color="success"
          delay={0.1}
        />
        <StatCard
          title="Remaining Passes"
          value={stats.remaining}
          subtext="Valid for entry"
          icon={Lock}
          color="error"
          delay={0.15}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.rate}%`}
          subtext="Check-in efficiency"
          icon={Percent}
          color="gold"
          delay={0.2}
        />
      </div>

      {/* Verification Console */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-2 order-2 lg:order-3 glass-panel p-6 rounded-xl border border-luxury-gold/15 shadow-xl relative overflow-hidden"
      >
        {/* Background luxury watermarks */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-12 translate-y-12">
          <Ticket className="w-64 h-64 text-luxury-gold" />
        </div>

        <h3 className="text-lg font-serif font-bold text-luxury-white mb-6 uppercase tracking-wider border-b border-luxury-gold/10 pb-3 flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-luxury-gold mr-2.5 animate-ping"></span>
          Verification Console
        </h3>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-xs text-luxury-gray uppercase tracking-widest font-semibold block">
              Scan / Enter Ticket Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder={profile?.role === 'super_admin' ? 'e.g. GLD225, PLT005' : `e.g. ${rolePrefix[profile?.role]}102`}
                  disabled={verifying}
                  className="w-full px-5 py-4 text-xl font-mono tracking-widest uppercase text-white rounded-lg glass-input text-center focus:border-luxury-gold"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={verifying}
                className="px-6 py-4 bg-luxury-gold hover:bg-luxury-gold-light hover:shadow-lg text-luxury-bg font-serif font-bold uppercase tracking-wider text-sm rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Verify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Animated Result Overlay / Display */}
        <AnimatePresence mode="wait">
          {scanResult && (
            <motion.div
              key={scanResult.code + scanResult.success}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={`mt-6 p-5 rounded-lg border text-center transition-all duration-300 ${
                scanResult.success 
                  ? 'border-luxury-success/30 bg-luxury-success/5 animate-glow-success' 
                  : 'border-luxury-error/30 bg-luxury-error/5 animate-shake shadow-lg shadow-luxury-error/5'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2.5">
                  {scanResult.success ? (
                    <Check className="w-6 h-6 text-luxury-success animate-bounce" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-luxury-error animate-pulse" />
                  )}
                  <h4 className={`text-lg font-serif font-black uppercase tracking-wider ${
                    scanResult.success ? 'text-luxury-success' : 'text-luxury-error'
                  }`}>
                    {scanResult.message}
                  </h4>
                </div>

                <div className="py-2.5 px-6 rounded-md bg-black/40 border border-white/5 font-mono text-2xl font-black text-luxury-white tracking-widest shadow-inner">
                  {scanResult.code}
                </div>

                <p className="text-xs text-luxury-gray max-w-md font-sans">
                  {scanResult.details}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Super Admin Progress Breakdown */}
      {profile?.role === 'super_admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 order-4 lg:order-4 glass-panel p-6 rounded-xl border border-luxury-gold/15"
        >
          <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light mb-4">
            Gate Wise Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Platinum Series (PLT)', val: categoryStats.platinum, col: 'bg-white' },
              { name: 'Gold Series (GLD)', val: categoryStats.gold, col: 'bg-[#FFD700]' },
              { name: 'Silver Series (SLR)', val: categoryStats.silver, col: 'bg-[#C0C0C0]' },
              { name: 'Bronze Series (BRZ)', val: categoryStats.bronze, col: 'bg-[#CD7F32]' },
            ].map((item) => {
              const percent = Math.round((item.val / 450) * 100) || 0
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-luxury-gray">{item.name}</span>
                    <span className="text-white">{item.val} / 450 ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-luxury-bg rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${item.col} rounded-full transition-all duration-1000`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Live Check-ins (Sidebar) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-1 order-5 lg:order-5 glass-panel p-6 rounded-xl border border-luxury-gold/15 shadow-xl flex flex-col h-[500px]"
      >
        <h3 className="text-sm font-serif font-bold text-luxury-white mb-4 uppercase tracking-widest flex items-center justify-between border-b border-luxury-gold/10 pb-3">
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-luxury-gold" />
            Live Check-ins
          </span>
          <span className="text-[10px] bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold font-sans">
            Realtime
          </span>
        </h3>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <AnimatePresence>
            {recentActivity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-xs text-luxury-gray/60 italic font-sans">
                  No check-ins recorded yet at this gate.
                </p>
              </div>
            ) : (
              recentActivity.map((activity, idx) => (
                <motion.div
                  key={activity.code + idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 rounded bg-luxury-bg-sec/60 border border-luxury-gold/5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-luxury-success" />
                    <div>
                      <p className="font-mono font-bold text-white tracking-widest">
                        {activity.code}
                      </p>
                      <p className="text-[10px] text-luxury-gray">
                        Verified by {activity.admin}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-luxury-gold-light/65 font-sans font-semibold">
                    {activity.time}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
