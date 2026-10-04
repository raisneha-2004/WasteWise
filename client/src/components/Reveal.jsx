import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASINGS } from '../utils/animations.js';

export default function Reveal({
  children,
  delay = 0,
  duration = 0.45,
  direction = 'up',
  className = '',
  once = true,
  margin = '-40px'
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialOffsets = () => {
    switch (direction) {
      case 'up':
        return { y: 24, x: 0 };
      case 'down':
        return { y: -24, x: 0 };
      case 'left':
        return { x: 24, y: 0 };
      case 'right':
        return { x: -24, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = { opacity: 0, ...getInitialOffsets() };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease: EASINGS.easeOut
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
