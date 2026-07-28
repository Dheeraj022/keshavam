import React, { useState, useEffect } from 'react'
import BrandLogo from './BrandLogo'
import { useAuth } from '../context/AuthContext'
import { useSound } from '../context/SoundContext'
import { Menu, LogOut, Volume2, VolumeX } from 'lucide-react'
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
    super_admin: 'border-luxury-gold/30 text-luxury-gold bg-luxury-gold/5',
    platinum: 'border-white/20 text-white/90 bg-white/5',
    gold: 'border-[#FFD700]/25 text-[#FFD700] bg-[#FFD700]/5',
    silver: 'border-[#C0C0C0]/25 text-[#C0C0C0] bg-[#C0C0C0]/5',
    bronze: 'border-[#CD7F32]/25 text-[#CD7F32] bg-[#CD7F32]/5',
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-luxury-bg/95 border-b border-white/5 px-2.5 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between backdrop-blur-md shadow-lg gap-2">
      {/* Brand Section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-luxury-gold hover:text-luxury-gold-light focus:outline-none p-1.5 rounded-lg border border-luxury-gold/20 hover:bg-luxury-card/30 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BrandLogo size="sm" />
      </div>

      {/* Clock and Unified Profile Capsule */}
      <div className="flex items-center space-x-4">
        {/* Real-time Clock Pill */}
        <div className="hidden md:flex items-center space-x-2 text-[10px] text-luxury-gray bg-black/35 px-4 py-2 rounded-full border border-white/5 font-mono tracking-wider font-semibold shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-luxury-success animate-pulse mr-0.5" />
          <span>{format(time, 'dd MMM yyyy, hh:mm:ss a')}</span>
        </div>

        {/* Audio Toggle Button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-full border transition-all duration-300 focus:outline-none flex items-center justify-center cursor-pointer ${
            soundEnabled 
              ? 'border-luxury-gold/25 text-luxury-gold bg-luxury-gold/5 hover:bg-luxury-gold/10' 
              : 'border-white/10 text-luxury-gray/50 hover:bg-white/5 hover:text-white'
          }`}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Integrated User Profile Capsule */}
        <div className="flex items-center space-x-3 bg-luxury-card border border-white/5 pl-2.5 pr-4 py-1.5 rounded-full shadow-lg">
          {/* Avatar on the left */}
          <div className="w-8 h-8 rounded-full border border-white/10 bg-luxury-bg flex items-center justify-center text-luxury-gold text-xs font-black shadow-inner uppercase flex-shrink-0">
            {profile?.name ? profile.name.charAt(0) : 'A'}
          </div>

          {/* Text details in the middle */}
          <div className="text-left hidden sm:block">
            <h4 className="text-[11px] font-bold text-white tracking-wide leading-tight">
              {profile?.name || 'Admin'}
            </h4>
            <span className={`inline-block mt-0.5 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${roleColors[profile?.role] || 'border-white/10 text-luxury-gray'}`}>
              {roleLabels[profile?.role] || 'Admin'}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

          {/* Logout button on the right */}
          <button
            onClick={logout}
            className="p-1 text-luxury-error/70 hover:text-luxury-error transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
