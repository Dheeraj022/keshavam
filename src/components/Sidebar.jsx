import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Search, 
  Settings, 
  MapPin, 
  X,
  Compass
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { profile, isSuperAdmin } = useAuth()

  const links = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'platinum', 'gold', 'silver', 'bronze'],
    },
    {
      name: 'Ticket Search',
      path: '/dashboard/ticket-search',
      icon: Search,
      roles: ['super_admin'],
    },
    {
      name: 'Analytics',
      path: '/dashboard/analytics',
      icon: BarChart3,
      roles: ['super_admin'],
    },
    {
      name: 'Admins Control',
      path: '/dashboard/admin-management',
      icon: Users,
      roles: ['super_admin'],
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: Settings,
      roles: ['super_admin', 'platinum', 'gold', 'silver', 'bronze'],
    },
  ]

  // Filter links by current user's role and dynamically rename 'Settings' for non-super_admins
  const activeLinks = links
    .filter((link) => link.roles.includes(profile?.role))
    .map((link) => {
      if (link.name === 'Settings' && profile?.role !== 'super_admin') {
        return { ...link, name: 'Account Info' }
      }
      return link
    })

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-luxury-bg/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 glass-panel-heavy border-r border-luxury-gold/15 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)]`}
      >
        {/* Top Section */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between px-4 mb-6 lg:hidden">
            <span className="font-serif text-sm text-luxury-gold font-bold tracking-widest uppercase">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="text-luxury-gray hover:text-luxury-gold focus:outline-none p-1 rounded-lg border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1.5">
            {activeLinks.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/dashboard'}
                  onClick={() => {
                    // Close sidebar on mobile select
                    if (window.innerWidth < 1024) onClose()
                  }}
                  className={({ isActive }) =>
                    `flex items-center px-6 py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-300 border-l-4 group ${
                      isActive
                        ? 'bg-luxury-gold/5 text-luxury-gold border-l-luxury-gold border-y-transparent border-r-transparent font-bold'
                        : 'border-l-transparent border-y-transparent border-r-transparent text-luxury-gray hover:text-luxury-gold-light hover:bg-[#10284F]/20'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`mr-3.5 w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                          isActive
                            ? 'text-luxury-gold'
                            : 'text-luxury-gray group-hover:text-luxury-gold-light'
                        }`}
                      />
                      <span className="font-serif font-semibold text-xs tracking-widest">{link.name}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer / Event details info box */}
        <div className="p-4 border-t border-luxury-gold/10 bg-luxury-bg/35">
          <div className="glass-panel p-3.5 rounded-lg border border-luxury-gold/5 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-luxury-gold-light">
              <Compass className="w-4 h-4 animate-spin-slow" style={{ animationDuration: '8s' }} />
              <span className="font-serif font-bold text-[10px] tracking-widest uppercase">
                Veneu Details
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-white font-medium flex items-center">
                <MapPin className="w-3.5 h-3.5 text-luxury-gold mr-1" />
                Moradabad, UP
              </p>
              <p className="text-[9px] text-luxury-gray tracking-wider leading-relaxed">
                Modern Spiritual Event & Premium Experience
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
