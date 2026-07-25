import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Loader from '../components/Loader'
import MainLayout from '../layouts/MainLayout'

// Lazy load pages for optimized bundle size & initial loading speed
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Analytics = lazy(() => import('../pages/Analytics'))
const AdminManagement = lazy(() => import('../pages/AdminManagement'))
const TicketSearch = lazy(() => import('../pages/TicketSearch'))
const Settings = lazy(() => import('../pages/Settings'))
const NotFound = lazy(() => import('../pages/NotFound'))

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-luxury-bg">
          <Loader text="Loading Temple System..." />
        </div>
      }
    >
      <Routes>
        {/* Public home page landing page */}
        <Route path="/" element={<Home />} />

        {/* Public auth route */}
        <Route path="/login" element={<Login />} />

        {/* Core system routes wrapped in MainLayout & ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Main shared pages */}
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />

          {/* Super Admin exclusive routes */}
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-management"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="ticket-search"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <TicketSearch />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
