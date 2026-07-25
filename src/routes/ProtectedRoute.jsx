import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-luxury-bg">
        <Loader />
      </div>
    )
  }

  // User is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user profile is loaded, check roles
  if (profile) {
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      // Not authorized for this page, bounce to base dashboard
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
