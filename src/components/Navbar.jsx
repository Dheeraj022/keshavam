import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSound } from '../context/SoundContext'
import { Menu, LogOut, Volume2, VolumeX, Shield, Clock } from 'lucide-react'
import { format } from 'date-fns'

const Navbar = ({ onToggleSidebar }) => {
  const { profile, logout } = useAuth()
  const { soundEnabled, setSoundEnabled } = useSound()
  const [time, setTime] = useState(new Date())

  // Ticking time effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const roleLabels = {
    super_admin: 'Super Admin',
    platinum: 'Platinum Admin',
    gold: 'Gold Admin',
    silver: 'Silver Admin',
    bronze: 'Bronze Admin',
  }

  const roleColors = {
    super_admin: 'border-luxury-gold text-luxury-gold bg-luxury-gold/5',
    platinum: 'border-[#E5E4E2] text-white bg-[#E5E4E2]/5',
    gold: 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5',
    silver: 'border-[#C0C0C0] text-[#C0C0C0] bg-[#C0C0C0]/5',
    bronze: 'border-[#CD7F32] text-[#CD7F32] bg-[#CD7F32]/5',
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-panel-heavy border-b border-luxury-gold/15 px-4 lg:px-8 py-3 flex items-center justify-between shadow-md">
      {/* Brand Section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-luxury-gold hover:text-luxury-gold-light focus:outline-none p-1.5 rounded-lg border border-luxury-gold/20 hover:bg-luxury-card/30 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2.5">
          {/* Decorative Temple-like Royal Icon */}
          <div className="w-9 h-9 rounded-full border border-luxury-gold overflow-hidden bg-luxury-bg shadow-lg shadow-luxury-gold/10 flex items-center justify-center">
            <img 
              src="/logo.jpg" 
              alt="Keshavam Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm lg:text-base font-serif font-extrabold tracking-[0.12em] text-white uppercase leading-none">
              Keshavam
            </h1>
            <p className="text-[10px] tracking-[0.25em] text-luxury-gold font-sans uppercase">
              Bhajan Clubbing
            </p>
          </div>
        </div>
      </div>

      {/* Clock and Utility Controls */}
      <div className="flex items-center space-x-4 lg:space-x-6">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-luxury-gray bg-luxury-bg/50 px-3.5 py-1.5 rounded border border-white/5 font-sans">
          <Clock className="w-3.5 h-3.5 text-luxury-gold" />
          <span>{format(time, 'dd MMM yyyy, hh:mm:ss a')}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded border transition-all focus:outline-none flex items-center justify-center ${
            soundEnabled 
              ? 'border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/5' 
              : 'border-white/10 text-luxury-gray/50 hover:bg-white/5'
          }`}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Admin Badge */}
        <div className="hidden sm:flex items-center space-x-3">
          <div className="text-right">
            <h4 className="text-xs font-semibold text-luxury-white">
              {profile?.name || 'Admin'}
            </h4>
            <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-full ${roleColors[profile?.role] || 'border-white/10 text-luxury-gray'}`}>
              {roleLabels[profile?.role] || 'Admin'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/10 bg-luxury-card flex items-center justify-center text-luxury-gold-light text-xs font-bold font-serif">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 border border-luxury-error/25 hover:border-luxury-error text-luxury-error hover:bg-luxury-error/5 rounded transition-all focus:outline-none flex items-center justify-center"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
