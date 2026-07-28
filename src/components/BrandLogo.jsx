import React from 'react'

const BrandLogo = ({ size = 'sm' }) => {
  // Dimensions classes depending on size
  const containerClasses = {
    sm: 'space-x-2 sm:space-x-3',
    md: 'space-x-2.5 sm:space-x-3.5',
    lg: 'space-x-3 sm:space-x-4',
  }

  // Responsive wrapper dimensions
  const logoWrapperClasses = {
    sm: 'w-[22px] h-[22px] min-[360px]:w-[26px] min-[360px]:h-[26px] sm:w-[30px] sm:h-[30px] border-luxury-gold/80 shadow-md shadow-luxury-gold/5',
    md: 'w-[24px] h-[24px] min-[360px]:w-[28px] min-[360px]:h-[28px] sm:w-[34px] sm:h-[34px] border-luxury-gold shadow-lg shadow-luxury-gold/10',
    lg: 'w-[26px] h-[26px] min-[360px]:w-[32px] min-[360px]:h-[32px] sm:w-[38px] sm:h-[38px] border-luxury-gold shadow-lg shadow-luxury-gold/10',
  }

  const titleClasses = {
    sm: 'text-[9.5px] min-[360px]:text-[11px] sm:text-xs lg:text-sm tracking-[0.1em] sm:tracking-[0.15em]',
    md: 'text-[10px] min-[360px]:text-[12px] sm:text-sm lg:text-base tracking-[0.1em] sm:tracking-[0.15em]',
    lg: 'text-[11px] min-[360px]:text-[13px] sm:text-base tracking-[0.1em] sm:tracking-[0.15em]',
  }

  const subtitleClasses = {
    sm: 'text-[7px] min-[360px]:text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] mt-0.5 sm:mt-1',
    md: 'text-[7.5px] min-[360px]:text-[8.5px] sm:text-[9px] tracking-[0.18em] sm:tracking-[0.2em] mt-0.5 sm:mt-1',
    lg: 'text-[8px] min-[360px]:text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.2em] mt-0.5 sm:mt-1',
  }

  const xClasses = {
    sm: 'text-[7.5px] mx-0.5 min-[360px]:mx-1 text-luxury-gold/80 font-bold',
    md: 'text-[8px] mx-1 min-[360px]:mx-1.5 text-luxury-gold font-bold',
    lg: 'text-[9px] mx-1 min-[360px]:mx-1.5 text-luxury-gold font-bold',
  }

  return (
    <div className={`flex items-center ${containerClasses[size]} select-none cursor-pointer`}>
      {/* Side-by-side logos: logo.jpg x logonew.png */}
      <div className="flex items-center flex-shrink-0">
        {/* First Logo (/logo.jpg) */}
        <div className={`relative rounded-full border overflow-hidden bg-luxury-bg flex items-center justify-center flex-shrink-0 ${logoWrapperClasses[size]}`}>
          <img 
            src="/logo.jpg" 
            alt="Atakshi Logo" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* X Separator */}
        <span className={`font-serif uppercase ${xClasses[size]}`}>
          x
        </span>

        {/* Second Logo (/logonew.png) */}
        <div className={`relative rounded-full border overflow-hidden bg-luxury-bg flex items-center justify-center flex-shrink-0 ${logoWrapperClasses[size]}`}>
          <img 
            src="/logonew.png" 
            alt="Shristi Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <h1 className={`font-serif font-black text-white uppercase flex items-center whitespace-nowrap leading-none ${titleClasses[size]}`}>
          Atakshi <span className="text-luxury-gold mx-0.5 sm:mx-1">x</span> Shristi
        </h1>
        <p className={`text-luxury-gold font-sans uppercase tracking-[0.25em] leading-none ${subtitleClasses[size]}`}>
          Event Management
        </p>
      </div>
    </div>
  )
}

export default BrandLogo
