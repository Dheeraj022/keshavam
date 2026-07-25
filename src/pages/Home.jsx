import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Search, CheckCircle, XCircle, Sparkles, UserCheck } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/Toast'

const Home = () => {
  const { isConfigured } = useAuth()
  
  // Public Ticket Status Checker States
  const [ticketCode, setTicketCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkResult, setCheckResult] = useState(null)

  const handleCheckTicket = async (e) => {
    e.preventDefault()
    if (!ticketCode) return

    const formattedCode = ticketCode.trim().replace(/\s+/g, '').toUpperCase()
    setLoading(true)
    setCheckResult(null)

    try {
      if (isConfigured) {
        // Query ticket publicly
        const { data, error } = await supabase
          .from('tickets')
          .select('ticket_code, category, checked_in')
          .eq('ticket_code', formattedCode)
          .single()

        if (error || !data) {
          setCheckResult({
            success: false,
            message: 'Invalid Ticket Code',
            details: 'This ticket code was not found in the official registry. Please check your card prefix (PLT, GLD, SLR, BRZ).'
          })
        } else {
          setCheckResult({
            success: true,
            code: data.ticket_code,
            category: data.category,
            checkedIn: data.checked_in
          })
        }
      } else {
        // Mock Sandbox Validation
        const raw = localStorage.getItem('kbc_mock_tickets')
        const tickets = raw ? JSON.parse(raw) : []
        const match = tickets.find(t => t.ticket_code === formattedCode)

        if (match) {
          setCheckResult({
            success: true,
            code: match.ticket_code,
            category: match.category,
            checkedIn: match.checked_in
          })
        } else {
          // Check prefix structure to provide a friendly mock error
          const prefix = formattedCode.substring(0, 3)
          if (['PLT', 'GLD', 'SLR', 'BRZ'].includes(prefix)) {
            setCheckResult({
              success: true,
              code: formattedCode,
              category: prefix === 'PLT' ? 'platinum' : prefix === 'GLD' ? 'gold' : prefix === 'SLR' ? 'silver' : 'bronze',
              checkedIn: false
            })
          } else {
            setCheckResult({
              success: false,
              message: 'Invalid Ticket Code',
              details: 'Mock Mode: Ticket code prefix must start with PLT, GLD, SLR, or BRZ followed by 3 digits (e.g. GLD125).'
            })
          }
        }
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to query ticketing register.')
    } finally {
      setLoading(false)
    }
  }

  const categoryLabels = {
    platinum: 'Platinum Premium VIP Pass',
    gold: 'Gold Gate Admission Pass',
    silver: 'Silver Gate Standard Pass',
    bronze: 'Bronze General Admission Pass',
  }

  const categoryColors = {
    platinum: 'text-white border-white/20 bg-white/5',
    gold: 'text-[#FFD700] border-[#FFD700]/25 bg-[#FFD700]/5',
    silver: 'text-[#C0C0C0] border-[#C0C0C0]/25 bg-[#C0C0C0]/5',
    bronze: 'text-[#CD7F32] border-[#CD7F32]/25 bg-[#CD7F32]/5',
  }

  return (
    <div className="min-h-screen bg-luxury-bg text-white relative overflow-hidden flex flex-col font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-luxury-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-luxury-gold/5 blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="w-full glass-panel border-b border-luxury-gold/15 px-6 lg:px-16 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full border border-luxury-gold overflow-hidden bg-luxury-bg shadow-lg shadow-luxury-gold/15 flex items-center justify-center">
            <img src="/logo.jpg" alt="Atakshi Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm lg:text-base font-serif font-black tracking-[0.15em] text-white uppercase leading-none">
              Atakshi
            </h1>
            <p className="text-[9px] tracking-[0.2em] text-luxury-gold font-sans uppercase mt-0.5">
              Event Management
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="px-4 py-2 border border-luxury-gold hover:bg-luxury-gold text-luxury-gold hover:text-luxury-bg font-serif font-bold uppercase tracking-widest text-[10px] rounded transition-all duration-300 flex items-center space-x-1.5 shadow-md shadow-luxury-gold/5"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Staff Login</span>
        </Link>
      </header>

      {/* Main Page Layout Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 lg:py-16 relative z-10 flex flex-col lg:flex-row gap-12 items-center">
        
        {/* Left Column: Event Presentation & Details */}
        <div className="w-full lg:w-1/2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/25 rounded-full text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-semibold animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Atakshi Presents</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-wide leading-tight text-white uppercase">
              Keshavam <br />
              <span className="gold-text-gradient font-black">Bhajan Clubbing Night</span>
            </h2>
            
            <p className="text-sm text-luxury-gray leading-relaxed max-w-lg font-sans">
              Experience the divine confluence of soulful devotional bhajans harmonized with premium, modern club-style sound production. A royal spiritual awakening under the stars.
            </p>
          </motion.div>

          {/* Details list card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="glass-panel p-6 rounded-xl border border-luxury-gold/20 space-y-4 shadow-xl shadow-black/30"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg text-luxury-gold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-luxury-gold font-bold font-serif">Event Date</h4>
                <p className="text-sm text-white font-semibold mt-1">1st September 2026</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 border-t border-white/5 pt-4">
              <div className="p-3 bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg text-luxury-gold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-luxury-gold font-bold font-serif">Timings</h4>
                <p className="text-sm text-white font-semibold mt-1">6:00 PM – 10:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 border-t border-white/5 pt-4">
              <div className="p-3 bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg text-luxury-gold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-luxury-gold font-bold font-serif">Venue Location</h4>
                <p className="text-xs text-white font-semibold mt-1 leading-relaxed">
                  Gandhi Maidan, Buddhi Vihar, Sector 7E, <br />
                  Near Saint Mary’s School, Moradabad
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Lord Krishna Banner */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-[450px]">
          
          {/* Banner Graphic Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full flex-1 rounded-2xl overflow-hidden relative border border-luxury-gold/25 shadow-2xl flex items-end p-6 group"
          >
            <img 
              src="/k.jpg" 
              alt="Divine Krishna background" 
              className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-[6000ms] ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg/95 via-luxury-bg/25 to-transparent" />
            
            <div className="relative z-10 glass-panel-heavy p-4 rounded-xl border border-luxury-gold/20 w-full text-center">
              <p className="font-serif italic text-luxury-gold-light text-xs leading-relaxed">
                "Celebrate spiritual heights and classical melodies."
              </p>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 border-t border-white/5 text-[10px] text-luxury-gray relative z-20 space-y-1">
        <p>© 2026 Atakshi Event Management. All rights reserved.</p>
        <p>
          Design & Developed by{' '}
          <a 
            href="https://webakaar.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-luxury-gold hover:text-luxury-gold-light hover:underline font-semibold transition-colors"
          >
            Webakaar
          </a>
        </p>
        <p className="text-white/20">Authorized ticket auditing console.</p>
      </footer>
    </div>
  )
}

export default Home
