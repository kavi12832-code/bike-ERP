import React, { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

/**
 * Animated number count-up for stat values on first appearance
 * 0 -> value over 900ms with easeOut, preserving currency, commas, decimals, and text suffixes.
 */
export function CountUp({ value, duration = 900, className = '' }) {
  if (value == null) return null;

  // If prefers-reduced-motion, or value has no digits, render immediately
  if (prefersReducedMotion) {
    return <span className={className}>{value}</span>;
  }

  const str = String(value);

  // Extract prefix (e.g. ₹ , $, +)
  const prefixMatch = str.match(/^[^\d.-]+/);
  const prefix = prefixMatch ? prefixMatch[0] : '';

  // Extract suffix (e.g. %, Lakhs, units, /26)
  const remainingAfterPrefix = str.slice(prefix.length);
  const numMatch = remainingAfterPrefix.match(/^[\d,]+(\.\d+)?/);

  if (!numMatch) {
    return <span className={className}>{value}</span>;
  }

  const rawNumStr = numMatch[0];
  const suffix = remainingAfterPrefix.slice(rawNumStr.length);

  // Parse pure number
  const cleanNum = parseFloat(rawNumStr.replace(/,/g, ''));
  if (isNaN(cleanNum)) {
    return <span className={className}>{value}</span>;
  }

  const hasDecimals = rawNumStr.includes('.');
  const decimalPlaces = hasDecimals ? rawNumStr.split('.')[1].length : 0;
  const isIndianFormat = rawNumStr.includes(',') && str.includes('₹');

  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo-like: 1 - Math.pow(2, -10 * progress)
      const easeVal = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const computed = cleanNum * easeVal;

      setCurrentVal(computed);

      if (progress < 1) {
        animId = window.requestAnimationFrame(step);
      }
    };

    animId = window.requestAnimationFrame(step);
    return () => {
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [cleanNum, duration]);

  // Format the current animated number
  let formattedNumber = '';
  if (hasDecimals) {
    formattedNumber = currentVal.toFixed(decimalPlaces);
  } else {
    formattedNumber = Math.round(currentVal).toString();
  }

  // Add commas
  if (isIndianFormat) {
    const parts = formattedNumber.split('.');
    let integerPart = parts[0];
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    if (otherNumbers !== '') {
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    formattedNumber = parts.length > 1 ? integerPart + '.' + parts[1] : integerPart;
  } else if (rawNumStr.includes(',')) {
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNumber = parts.join('.');
  }

  return (
    <span className={className}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}

