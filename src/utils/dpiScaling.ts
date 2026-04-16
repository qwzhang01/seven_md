import { useState, useEffect } from 'react';

/**
 * DPI scaling utilities for Windows platform
 * Provides functions to detect and adapt to Windows DPI scaling
 */

/**
 * Detects the current DPI scaling factor
 * @returns The current DPI scaling factor (e.g., 1.0 for 100%, 1.5 for 150%)
 */
export function getDPIScalingFactor(): number {
  if (typeof window === 'undefined') return 1.0;
  
  // For Windows, we can use devicePixelRatio
  const dpr = window.devicePixelRatio || 1.0;
  
  // Common DPI scaling factors on Windows: 100%, 125%, 150%, 175%, 200%
  // Round to nearest common scaling factor
  const commonScales = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0];
  const closestScale = commonScales.reduce((prev, curr) => {
    return Math.abs(curr - dpr) < Math.abs(prev - dpr) ? curr : prev;
  });
  
  return closestScale;
}

/**
 * Applies DPI-aware scaling to CSS values
 * @param baseValue The base value at 100% scaling
 * @returns The scaled value based on current DPI
 */
export function scaleForDPI(baseValue: number): number {
  const scaleFactor = getDPIScalingFactor();
  return Math.round(baseValue * scaleFactor);
}

/**
 * Generates CSS classes for DPI-aware styling
 * @returns Object containing DPI-specific CSS class names
 */
export function getDPIClasses(): { [key: string]: string } {
  const scaleFactor = getDPIScalingFactor();
  const isWindows = navigator.platform.toLowerCase().includes('win');
  
  if (!isWindows) {
    return {};
  }
  
  const classes: { [key: string]: string } = {};
  
  // Add DPI-specific classes
  if (scaleFactor >= 1.5) {
    classes['dpi-high'] = 'dpi-high';
  }
  
  if (scaleFactor >= 2.0) {
    classes['dpi-very-high'] = 'dpi-very-high';
  }
  
  // Add specific scale factor classes
  classes[`dpi-${Math.round(scaleFactor * 100)}`] = `dpi-${Math.round(scaleFactor * 100)}`;
  
  return classes;
}

/**
 * Adjusts font sizes for better readability on high DPI displays
 * @param baseSize Base font size in pixels
 * @returns Adjusted font size string
 */
export function getDPIAwareFontSize(baseSize: number): string {
  const scaleFactor = getDPIScalingFactor();
  const isWindows = navigator.platform.toLowerCase().includes('win');
  
  if (!isWindows || scaleFactor <= 1.25) {
    return `${baseSize}px`;
  }
  
  // Increase font size for better readability on high DPI
  const adjustedSize = Math.max(baseSize, Math.round(baseSize * Math.min(scaleFactor, 1.5)));
  return `${adjustedSize}px`;
}

/**
 * Adjusts spacing for better visual balance on high DPI displays
 * @param baseSpacing Base spacing value
 * @returns Adjusted spacing value
 */
export function getDPIAwareSpacing(baseSpacing: number): number {
  const scaleFactor = getDPIScalingFactor();
  const isWindows = navigator.platform.toLowerCase().includes('win');
  
  if (!isWindows || scaleFactor <= 1.25) {
    return baseSpacing;
  }
  
  // Slightly increase spacing for better visual balance
  return Math.round(baseSpacing * Math.min(scaleFactor, 1.2));
}

/**
 * Hook for React components to handle DPI scaling
 */
export function useDPIScaling() {
  const [scaleFactor, setScaleFactor] = useState(getDPIScalingFactor());
  
  useEffect(() => {
    const handleResize = () => {
      setScaleFactor(getDPIScalingFactor());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    scaleFactor,
    scaleForDPI: (value: number) => scaleForDPI(value),
    getDPIAwareFontSize,
    getDPIAwareSpacing,
    getDPIClasses: () => getDPIClasses()
  };
}