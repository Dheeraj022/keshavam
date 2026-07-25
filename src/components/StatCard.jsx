import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, subtext, icon: Icon, color = 'gold', delay = 0 }) => {
  const colorMap = {
    gold: {
      text: 'text-luxury-gold',
      border: 'border-luxury-gold/15',
      iconColor: 'text-luxury-gold border-luxury-gold/20 bg-luxury-gold/5',
    },
    success: {
      text: 'text-luxury-success',
      border: 'border-luxury-success/20',
      iconColor: 'text-luxury-success border-luxury-success/20 bg-luxury-success/5',
    },
    error: {
      text: 'text-luxury-error',
      border: 'border-luxury-error/20',
      iconColor: 'text-luxury-error border-luxury-error/20 bg-luxury-error/5',
    },
    info: {
      text: 'text-luxury-gold-light',
      border: 'border-white/10',
      iconColor: 'text-luxury-gold-light border-white/15 bg-white/5',
    },
  }

  const selectedColor = colorMap[color] || colorMap.gold

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, borderColor: 'rgba(212, 175, 55, 0.3)' }}
      className={`bg-luxury-card p-5 rounded-xl flex items-center justify-between border ${selectedColor.border} transition-all duration-300 shadow-xl`}
    >
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-luxury-gray font-semibold">
          {title}
        </p>
        <h3 className="text-2xl font-bold font-sans text-white tracking-tight">
          {value}
        </h3>
        {subtext && (
          <p className="text-[10px] text-luxury-gray/60 font-sans tracking-wide">
            {subtext}
          </p>
        )}
      </div>

      <div className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-inner ${selectedColor.iconColor}`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
    </motion.div>
  )
}

export default StatCard
