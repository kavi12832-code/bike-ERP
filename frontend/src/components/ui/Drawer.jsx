import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { modalOverlayVariants, drawerVariants } from '../../lib/motion';

export function Drawer({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur Fade In 250ms */}
          <motion.div
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 glass-modal-overlay"
            onClick={onClose}
          />

          {/* Frosted Glass Drawer Panel */}
          <motion.div
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              'relative z-10 w-screen glass-modal-panel rounded-l-[32px] rounded-r-none border-l border-white/40 shadow-2xl flex flex-col h-full overflow-hidden text-slate-900',
              sizeClasses[size],
              className
            )}
          >
            <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between bg-white/20 shrink-0">
              <h3 className="text-base font-bold text-[#0b1b2b]">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Drawer;
