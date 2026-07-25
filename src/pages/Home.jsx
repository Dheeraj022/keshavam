import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Sparkles, UserCheck, Volume2, VolumeX } from 'lucide-react'

const Home = () => {
  // Krishna Theme Audio States
  const [isPlaying, setIsPlaying] = useState(false)
  const userPausedRef = useRef(false)

  useEffect(() => {
    // Access or create global audio instance
    if (!window.globalThemeAudio) {
      window.globalThemeAudio = new Audio("/Krishna Theme _ Krish theme _ Flute cover By Lakhinandan Lahon.mp3")
      window.globalThemeAudio.loop = true
      window.globalThemeAudio.volume = 0.5 // pleasant volume
    }

    const audio = window.globalThemeAudio

    // Ensure it is paused by default when entering page
    audio.pause()

    const setInitialTime = () => {
      try {
        audio.currentTime = 30
      } catch (e) {
        console.warn("Failed to set initial time:", e)
      }
    }

    // Set time immediately if metadata is already loaded, otherwise listen to event
    if (audio.readyState >= 1) {
      setInitialTime()
    } else {
      audio.addEventListener('loadedmetadata', setInitialTime)
    }

    const handleGlobalClick = () => {
      // Play on first click anywhere if user hasn't explicitly paused it
      if (audio.paused && !userPausedRef.current) {
        if (audio.readyState >= 1 && audio.currentTime < 30) {
          setInitialTime()
        }
        audio.play()
          .then(() => {
            // Re-assert start offset on play resolution (critical for mobile lazy loading)
            if (audio.currentTime < 30) {
              setInitialTime()
            }
            setIsPlaying(true)
          })
          .catch(err => {
            console.warn("Autoplay was prevented or audio failed to load:", err)
          })
      }
    }

    // Add global click listener to page
    document.addEventListener('click', handleGlobalClick)

    return () => {
      document.removeEventListener('click', handleGlobalClick)
      audio.removeEventListener('loadedmetadata', setInitialTime)
      // Note: We do not pause the audio here so it continues playing when shifting to other public pages like Login
    }
  }, [])

  const togglePlay = (e) => {
    e.stopPropagation() // prevent global click from triggering
    const audio = window.globalThemeAudio
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      userPausedRef.current = true
      setIsPlaying(false)
    } else {
      userPausedRef.current = false
      if (audio.readyState >= 1 && audio.currentTime < 30) {
        audio.currentTime = 30
      }
      audio.play()
        .then(() => {
          if (audio.currentTime < 30) {
            audio.currentTime = 30
          }
          setIsPlaying(true)
        })
        .catch(err => {
          console.error("Playback failed:", err)
        })
    }
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

      {/* Floating Krishna Theme Music Controller */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-luxury-bg-sec/90 backdrop-blur-md border border-luxury-gold/30 rounded-full pl-4 pr-3 py-2 text-xs shadow-lg shadow-black/50"
        >
          <div className="flex flex-col text-left pr-1">
            <span className="font-serif text-[10px] uppercase tracking-wider text-luxury-gold font-bold">Divine Melody</span>
            <span className="text-[9px] text-white/60 font-sans truncate max-w-[80px]">Krishna Flute</span>
          </div>

          {/* Sound waves visualization when playing */}
          <div className="flex items-end gap-[2px] h-3.5 w-4 mb-0.5">
            <motion.div 
              animate={isPlaying ? { height: ["2px", "12px", "2px"] } : { height: "2px" }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
              className="w-[2px] bg-luxury-gold" 
            />
            <motion.div 
              animate={isPlaying ? { height: ["2px", "16px", "2px"] } : { height: "2px" }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
              className="w-[2px] bg-luxury-gold" 
            />
            <motion.div 
              animate={isPlaying ? { height: ["2px", "10px", "2px"] } : { height: "2px" }}
              transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.3 }}
              className="w-[2px] bg-luxury-gold" 
            />
          </div>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-luxury-gold hover:bg-luxury-gold-light text-luxury-bg flex items-center justify-center transition-colors duration-300 focus:outline-none shadow-md shadow-luxury-gold/20 cursor-pointer"
            aria-label={isPlaying ? "Mute Krishna Theme" : "Play Krishna Theme"}
          >
            {isPlaying ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
