import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-bg/85 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md glass-panel-heavy p-6 rounded-xl border border-luxury-gold/20 shadow-2xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-luxury-gray hover:text-luxury-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${isDanger ? 'bg-luxury-error/15 text-luxury-error' : 'bg-luxury-gold/15 text-luxury-gold'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-luxury-white tracking-wide uppercase">
                {title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-luxury-gray mb-6 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-luxury-gray hover:text-luxury-white hover:bg-white/5 border border-white/10 rounded transition-all focus:outline-none"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold text-luxury-bg rounded transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none ${
                  isDanger 
                    ? 'bg-luxury-error hover:bg-luxury-error/95 shadow-lg shadow-luxury-error/25 text-white' 
                    : 'bg-luxury-gold hover:bg-luxury-gold-light shadow-lg shadow-luxury-gold/25'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal
