import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ShieldAlert, Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-luxury-bg px-4 relative overflow-hidden bg-gradient-to-br from-luxury-bg via-luxury-bg to-luxury-bg-sec">
      {/* Background radial glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-luxury-gold/5 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-panel-heavy p-8 rounded-2xl border border-luxury-gold/25 shadow-2xl text-center relative"
      >
        <div className="inline-flex w-16 h-16 rounded-full border-2 border-luxury-gold items-center justify-center bg-luxury-bg shadow-xl shadow-luxury-gold/15 mb-6 animate-gold-pulse">
          <ShieldAlert className="w-8 h-8 text-luxury-gold" />
        </div>

        <h1 className="text-6xl font-serif font-black text-luxury-gold mb-2">
          404
        </h1>
        <h2 className="text-xl font-serif font-bold text-white uppercase tracking-wider mb-3">
          Sacred Path Lost
        </h2>
        <p className="text-xs text-luxury-gray mb-8 leading-relaxed max-w-sm mx-auto font-sans">
          The sanctuary route you requested is unavailable. Return to the main gate to verify ticket entry logs.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-luxury-gold hover:bg-luxury-gold-light hover:shadow-lg text-luxury-bg font-serif font-bold uppercase tracking-widest text-xs rounded-lg transition-all duration-300 transform active:scale-95 border border-luxury-gold shadow-lg shadow-luxury-gold/15"
        >
          <Home className="w-4 h-4" />
          <span>To Dashboard</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
