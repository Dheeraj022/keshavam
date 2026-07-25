import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, Database } from 'lucide-react'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isConfigured } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-luxury-bg text-white">
      {/* Header Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Panel */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gradient-to-br from-luxury-bg via-luxury-bg to-luxury-bg-sec relative">
          {/* Missing Database/Supabase Config Banner */}
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl border border-luxury-error/30 bg-luxury-error/5 backdrop-blur-md flex items-center space-x-3.5 shadow-lg shadow-luxury-error/5 animate-pulse">
              <div className="p-2 bg-luxury-error/15 rounded text-luxury-error">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-serif">
                  Database Offline / Connection Required
                </h4>
                <p className="text-xs text-luxury-gray mt-0.5">
                  The application is running in local demonstration mode. To connect to Supabase, set <code className="bg-black/35 px-1.5 py-0.5 rounded text-luxury-gold-light border border-white/5 font-mono text-[10px]">VITE_SUPABASE_URL</code> and <code className="bg-black/35 px-1.5 py-0.5 rounded text-luxury-gold-light border border-white/5 font-mono text-[10px]">VITE_SUPABASE_ANON_KEY</code> inside your <code className="bg-black/35 px-1.5 py-0.5 rounded text-luxury-gold-light border border-white/5 font-mono text-[10px]">.env</code> file.
                </p>
              </div>
            </div>
          )}

          {/* Child Page Rendering */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
