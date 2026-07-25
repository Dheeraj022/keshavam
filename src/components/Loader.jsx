import React from 'react'

const Loader = ({ size = 'md', text = 'Loading Divine Experience...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-16 h-16 border-2',
    lg: 'w-24 h-24 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing aura */}
        <div className="absolute inset-0 rounded-full bg-luxury-gold/5 blur-md animate-gold-pulse"></div>
        
        {/* Spinning border ring */}
        <div 
          className={`${sizeClasses[size]} rounded-full border-t-luxury-gold border-r-transparent border-b-luxury-gold/30 border-l-transparent animate-spin`}
          style={{ animationDuration: '1.2s' }}
        ></div>

        {/* Center glowing dot */}
        <div className="absolute w-2 h-2 rounded-full bg-luxury-gold animate-ping"></div>
      </div>
      
      {text && (
        <p className="font-display text-xs tracking-[0.25em] text-luxury-gold-light/75 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default Loader
