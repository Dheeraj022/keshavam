import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useSound } from '../context/SoundContext'
import { motion } from 'framer-motion'
import { User, Volume2, VolumeX, Shield, HelpCircle, FileText, CheckCircle2 } from 'lucide-react'

const Settings = () => {
  const { profile } = useAuth()
  const { soundEnabled, setSoundEnabled, playSuccess, playFailure } = useSound()

  const roleLabels = {
    super_admin: 'Super Admin (Full Database Access)',
    platinum: 'Platinum Admin (PLT001 - PLT450 Only)',
    gold: 'Gold Admin (GLD001 - GLD450 Only)',
    silver: 'Silver Admin (SLR001 - SLR450 Only)',
    bronze: 'Bronze Admin (BRZ001 - BRZ450 Only)',
  }

  const handleTestSound = (type) => {
    if (type === 'success') {
      playSuccess()
    } else {
      playFailure()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl lg:text-2xl font-serif font-bold text-white uppercase tracking-wider">
          Profile & Settings
        </h2>
        <p className="text-xs text-luxury-gray mt-1 font-sans">
          Configure check-in terminal options and view authorization metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Admin Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-luxury-card p-6 rounded-xl border border-white/5 shadow-2xl space-y-6 ${
            profile?.role !== 'super_admin' ? 'md:col-span-2 max-w-2xl mx-auto w-full' : ''
          }`}
        >
          <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-luxury-gold" />
            Admin Profile Detail
          </h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border border-luxury-gold flex items-center justify-center bg-luxury-bg shadow-lg shadow-luxury-gold/10 text-luxury-gold text-2xl font-serif font-black uppercase">
                {profile?.name ? profile.name.charAt(0) : 'A'}
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-serif tracking-wide uppercase">
                  {profile?.name}
                </h4>
                <p className="text-xs text-luxury-gold-light mt-0.5 font-mono">
                  ID: {profile?.id}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-luxury-gray">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span>Email Address</span>
                <span className="text-white font-semibold">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span>Assigned Role</span>
                <span className="text-luxury-gold font-bold uppercase tracking-wider">
                  {profile?.role?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col py-1.5">
                <span>Permitted Check-in Gates</span>
                <span className="text-white font-semibold mt-1 bg-luxury-bg/50 border border-white/5 px-2.5 py-1.5 rounded text-[10px] tracking-wider uppercase font-serif">
                  {roleLabels[profile?.role] || 'Standard check-in access'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Audio & Interface Config (Only visible to Super Admins) */}
        {profile?.role === 'super_admin' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-luxury-card p-6 rounded-xl border border-white/5 shadow-2xl space-y-6"
          >
            <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-luxury-gold" />
              Audio Preferences
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-3.5 bg-luxury-bg/50 border border-white/5 rounded-lg">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                    Audio Chimes
                  </h4>
                  <p className="text-[10px] text-luxury-gray mt-0.5">
                    Play verification chime sounds on check-in
                  </p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    soundEnabled ? 'bg-luxury-gold' : 'bg-luxury-card border border-white/10'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      soundEnabled ? 'translate-x-6 bg-luxury-bg' : 'translate-x-0 bg-luxury-gray'
                    }`}
                  />
                </button>
              </div>

              {soundEnabled && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-2">
                    Test Sound Synthesizer
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTestSound('success')}
                      className="py-2.5 px-4 bg-luxury-success/10 hover:bg-luxury-success/15 border border-luxury-success/35 hover:border-luxury-success text-luxury-success text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                    >
                      Success Chime
                    </button>
                    <button
                      onClick={() => handleTestSound('failure')}
                      className="py-2.5 px-4 bg-luxury-error/10 hover:bg-luxury-error/15 border border-luxury-error/35 hover:border-luxury-error text-luxury-error text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                    >
                      Failure Buzzer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>

      {/* Operational Guidelines Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-luxury-card p-6 rounded-xl border border-white/5 shadow-2xl space-y-4"
      >
        <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-luxury-gold" />
          Terminal Operational Procedures
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-luxury-gray leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider">
              1. Scanning Flow
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Keep the cursor focused inside the verify input box.</li>
              <li>Scan the code or type using manual entry.</li>
              <li>Wait for visual glow and check sounds before proceeding.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider">
              2. Duplicate Prevention
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Enter is bound as a shortcut to verify immediately.</li>
              <li>The verification button freezes for 500ms to block double taps.</li>
              <li>If already checked in, it shows exactly who checked it.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings
