/**
 * Centralized Framer Motion Variants & Animation Specs
 * Glass Admin Dashboard Theme
 */

// Easings & Transitions
export const easeOutExpo = [0.22, 1, 0.36, 1];
export const easeHover = [0.4, 0, 0.2, 1];
export const springTransition = { type: 'spring', stiffness: 260, damping: 26 };
export const springSnappy = { type: 'spring', stiffness: 350, damping: 30 };

// Detect prefers-reduced-motion in browser
export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Page Route Transitions (Wrap in AnimatePresence mode="wait")
export const pageTransitionVariants = {
  initial: prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: 10,
      },
  animate: prefersReducedMotion
    ? { opacity: 1, transition: { duration: 0.15 } }
    : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.35,
          ease: easeOutExpo,
        },
      },
  exit: prefersReducedMotion
    ? { opacity: 0, transition: { duration: 0.15 } }
    : {
        opacity: 0,
        y: -6,
        transition: {
          duration: 0.18,
          ease: easeHover,
        },
      },
};

// Staggered Container for Page Cards & Sections
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Fast Stagger Container for Lists and Table Rows
export const listStaggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.03,
    },
  },
};

// Staggered Card Entrance Item (Smooth, non-jarring, no layout shift)
export const cardEntranceVariants = {
  initial: prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: 12,
      },
  animate: prefersReducedMotion
    ? { opacity: 1, transition: { duration: 0.15 } }
    : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: easeOutExpo,
        },
      },
};

// Table Row Stagger Entrance Item
export const tableRowVariants = {
  initial: prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: 12,
      },
  animate: prefersReducedMotion
    ? { opacity: 1, transition: { duration: 0.15 } }
    : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.35,
          ease: easeOutExpo,
        },
      },
};

// Card Hover & Tap Motion Props
export const cardHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        y: -5,
        transition: { duration: 0.25, ease: easeHover },
      },
      whileTap: {
        scale: 0.98,
        transition: { duration: 0.1 },
      },
    };

// Button Hover & Tap Motion Props
export const buttonHoverProps = prefersReducedMotion
  ? {}
  : {
      whileHover: {
        y: -1,
        transition: { duration: 0.15, ease: easeHover },
      },
      whileTap: {
        scale: 0.98,
        transition: { duration: 0.08 },
      },
    };

// Modal & Dialog Transitions
export const modalOverlayVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: easeHover },
  },
};

export const modalPanelVariants = {
  initial: prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        scale: 0.96,
        y: 10,
      },
  animate: prefersReducedMotion
    ? { opacity: 1, transition: { duration: 0.2 } }
    : {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: easeOutExpo,
        },
      },
  exit: prefersReducedMotion
    ? { opacity: 0, transition: { duration: 0.15 } }
    : {
        opacity: 0,
        scale: 0.96,
        y: 8,
        transition: {
          duration: 0.18,
          ease: easeHover,
        },
      },
};

// Drawer Slide-in Variants (from Right)
export const drawerVariants = {
  initial: prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        x: '100%',
      },
  animate: prefersReducedMotion
    ? { opacity: 1, transition: { duration: 0.2 } }
    : {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.4,
          ease: easeOutExpo,
        },
      },
  exit: prefersReducedMotion
    ? { opacity: 0, transition: { duration: 0.15 } }
    : {
        opacity: 0,
        x: '100%',
        transition: {
          duration: 0.25,
          ease: easeHover,
        },
      },
};

// Sidebar Initial Entrance (once on app mount)
export const sidebarEntranceVariants = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

export const sidebarItemVariants = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: easeOutExpo },
  },
};

