/**
 * Main Theme Export
 * Centralized theme configuration
 */

import { colors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, safeArea } from './spacing';

export const theme = {
  colors,
  darkColors,
  typography,
  spacing,
  borderRadius,
  safeArea,

  // Shadow styles
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

export type Theme = typeof theme;

// Re-export everything for convenience
export { colors, darkColors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, safeArea } from './spacing';
