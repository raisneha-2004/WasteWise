// Centralized Framer Motion Animation Variants & Utilities

export const EASINGS = {
  easeOut: [0.16, 1, 0.3, 1], // Smooth exponential ease-out
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 400, damping: 28 },
  gentleSpring: { type: 'spring', stiffness: 260, damping: 20 },
  bouncySpring: { type: 'spring', stiffness: 500, damping: 15 }
};

// Fade up transition (default standard)
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration || 0.45,
      delay: custom.delay || 0,
      ease: EASINGS.easeOut
    }
  })
};

// Fade down transition (for headers, banners, badges)
export const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration || 0.45,
      delay: custom.delay || 0,
      ease: EASINGS.easeOut
    }
  })
};

// Pure opacity fade
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      duration: custom.duration || 0.4,
      delay: custom.delay || 0,
      ease: EASINGS.easeOut
    }
  })
};

// Scale in for cards, modals, or indicators
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (custom = {}) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: custom.duration || 0.4,
      delay: custom.delay || 0,
      ease: EASINGS.easeOut
    }
  }),
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.25, ease: EASINGS.easeOut }
  }
};

// Stagger parent container for lists and grids
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

// Stagger word/letter reveal variant
export const wordReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: EASINGS.easeOut
    }
  })
};

// List item slide-in and exit (ideal for history, notifications)
export const listItemVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: EASINGS.easeOut
    }
  }),
  exit: {
    opacity: 0,
    x: -25,
    scale: 0.96,
    transition: { duration: 0.25, ease: 'easeIn' }
  }
};

// Subtle Hazard Shake
export const hazardShake = {
  animate: {
    x: [0, -3, 3, -3, 3, -1, 1, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 3.5,
      ease: 'easeInOut'
    }
  }
};

// Pulse glow loop
export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 15px -3px rgba(16, 185, 129, 0.35)',
      '0 0 35px 2px rgba(16, 185, 129, 0.6)',
      '0 0 15px -3px rgba(16, 185, 129, 0.35)'
    ],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 12
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: EASINGS.easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};
