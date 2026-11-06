import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { modalOverlayVariants, modalPanelVariants } from '../../lib/motion';

export function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Fade In 250ms */}
          <motion.div
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 glass-modal-overlay"
          />

          {/* Frosted Glass Modal Panel Scale 0.96 -> 1, 300ms (exit 180ms) */}
          <motion.div
            variants={modalPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              'w-full glass-modal-panel overflow-hidden flex flex-col max-h-[90vh] z-10 relative select-none',
              sizeClasses[size],
              className
            )}
          >
            <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between bg-white/20">
              <h3 className="text-base font-bold text-[#0b1b2b]">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-slate-900">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
