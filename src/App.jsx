import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'
import AppRoutes from './routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          {/* Main system routes */}
          <AppRoutes />
          
          {/* Premium toaster notification anchor */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              // Custom container duration
              duration: 4000
            }}
          />
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
