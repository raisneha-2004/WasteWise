import React, { useEffect, useState, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { formatNumber } from '../utils/formatters.js';

/**
 * AnimatedCounter component
 * Smoothly animates numbers from 0 to target value on viewport entry.
 * Safely extracts numeric portion and preserves units/suffixes with Intl localization.
 */
export default function AnimatedCounter({ value, duration = 1.2, language, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const shouldReduceMotion = useReducedMotion();

  // Parse raw value to extract numeric target and prefix/suffix
  const rawString = String(value ?? '0');
  const match = rawString.match(/^([^\d.-]*)([-+]?\d*\.?\d+)(.*)$/);

  const prefix = match ? match[1] : '';
  const targetNumber = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : '';

  // Determine decimal precision from original value
  const decimalCount = match && match[2].includes('.') ? match[2].split('.')[1].length : 0;

  const [currentValue, setCurrentValue] = useState(shouldReduceMotion ? targetNumber : 0);

  useEffect(() => {
    if (shouldReduceMotion || !isInView || isNaN(targetNumber)) return;

    let startTimestamp = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

      // Ease-out cubic formula
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = easeOutProgress * targetNumber;

      setCurrentValue(nextVal);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(targetNumber);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, targetNumber, duration, shouldReduceMotion]);

  const activeValue = shouldReduceMotion ? targetNumber : currentValue;
  const formattedDisplay = decimalCount > 0
    ? (language ? formatNumber(activeValue, language, { minimumFractionDigits: decimalCount, maximumFractionDigits: decimalCount }) : activeValue.toFixed(decimalCount))
    : (language ? formatNumber(Math.round(activeValue), language) : Math.round(activeValue).toString());

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedDisplay}
      {suffix}
    </span>
  );
}
