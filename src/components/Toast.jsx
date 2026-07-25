import React from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// Custom toast notification markup matching the luxury theme
export const showToast = {
  success: (message, duration = 4000) => {
    toast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex max-w-md w-full glass-panel-heavy rounded-lg pointer-events-auto shadow-2xl overflow-hidden border-t-2 border-t-luxury-success gold-glow"
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <CheckCircle className="h-6 w-6 text-luxury-success" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-luxury-white font-serif uppercase tracking-wider">
                      Success
                    </p>
                    <p className="mt-1 text-xs text-luxury-gray">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-luxury-gold/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-medium text-luxury-gold-light hover:text-luxury-gold hover:bg-luxury-card/30 transition-all focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration }
    )
  },

  error: (message, duration = 4000) => {
    toast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex max-w-md w-full glass-panel-heavy rounded-lg pointer-events-auto shadow-2xl overflow-hidden border-t-2 border-t-luxury-error"
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <XCircle className="h-6 w-6 text-luxury-error" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-luxury-white font-serif uppercase tracking-wider">
                      Error
                    </p>
                    <p className="mt-1 text-xs text-luxury-gray font-sans">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-luxury-gold/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-medium text-luxury-gold-light hover:text-luxury-gold hover:bg-luxury-card/30 transition-all focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration }
    )
  },

  warning: (message, duration = 5000) => {
    toast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex max-w-md w-full glass-panel-heavy rounded-lg pointer-events-auto shadow-2xl overflow-hidden border-t-2 border-t-luxury-gold"
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <AlertTriangle className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-luxury-white font-serif uppercase tracking-wider">
                      Warning
                    </p>
                    <p className="mt-1 text-xs text-luxury-gray">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-luxury-gold/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-medium text-luxury-gold-light hover:text-luxury-gold hover:bg-luxury-card/30 transition-all focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration }
    )
  },

  info: (message, duration = 3000) => {
    toast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex max-w-md w-full glass-panel-heavy rounded-lg pointer-events-auto shadow-2xl overflow-hidden border-t-2 border-t-luxury-gold-light"
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <Info className="h-6 w-6 text-luxury-gold-light" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-luxury-white font-serif uppercase tracking-wider">
                      Information
                    </p>
                    <p className="mt-1 text-xs text-luxury-gray">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-luxury-gold/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-medium text-luxury-gold-light hover:text-luxury-gold hover:bg-luxury-card/30 transition-all focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration }
    )
  },
}
