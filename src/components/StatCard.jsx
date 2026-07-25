import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, subtext, icon: Icon, color = 'gold', delay = 0 }) => {
  const colorMap = {
    gold: {
      text: 'text-luxury-gold',
      glow: 'shadow-luxury-gold/5 border-luxury-gold/20',
      iconBg: 'bg-luxury-gold/10 text-luxury-gold',
    },
    success: {
      text: 'text-luxury-success',
      glow: 'shadow-luxury-success/5 border-luxury-success/20',
      iconBg: 'bg-luxury-success/10 text-luxury-success',
    },
    error: {
      text: 'text-luxury-error',
      glow: 'shadow-luxury-error/5 border-luxury-error/20',
      iconBg: 'bg-luxury-error/10 text-luxury-error',
    },
    info: {
      text: 'text-luxury-gold-light',
      glow: 'shadow-luxury-gold-light/5 border-luxury-gold-light/20',
      iconBg: 'bg-luxury-gold-light/10 text-luxury-gold-light',
    },
  }

  const selectedColor = colorMap[color] || colorMap.gold

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glass-panel p-6 rounded-xl flex items-center justify-between shadow-lg border ${selectedColor.glow} transition-all duration-300`}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-luxury-gray font-medium">
          {title}
        </p>
        <h3 className="text-3xl font-bold font-serif text-luxury-white">
          {value}
        </h3>
        {subtext && (
          <p className="text-xs text-luxury-gray/70">
            {subtext}
          </p>
        )}
      </div>

      <div className={`p-3.5 rounded-lg ${selectedColor.iconBg} border border-white/5 shadow-inner`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </motion.div>
  )
}

export default StatCard
