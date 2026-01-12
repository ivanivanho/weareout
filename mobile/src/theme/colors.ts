/**
 * Design System Colors
 * Extracted from Figma Make design
 */

export const colors = {
  // Base colors
  background: '#FFFFFF',
  foreground: '#000000',

  // Gray scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Muted backgrounds
  muted: '#ECECF0',
  mutedForeground: '#6B7280',

  // Accent colors
  accent: '#E9EBEF',
  accentForeground: '#000000',

  // Border
  border: 'rgba(0, 0, 0, 0.1)',

  // Primary blue
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Status colors
  success: {
    light: '#10B981',
    DEFAULT: '#059669',
    dark: '#047857',
    background: '#ECFDF5',
  },

  warning: {
    light: '#F59E0B',
    DEFAULT: '#D97706',
    dark: '#B45309',
    background: '#FEF3C7',
  },

  danger: {
    light: '#EF4444',
    DEFAULT: '#DC2626',
    dark: '#B91C1C',
    background: '#FEE2E2',
  },

  critical: {
    light: '#FCA5A5',
    DEFAULT: '#EF4444',
    dark: '#DC2626',
    background: '#FEE2E2',
  },

  low: {
    light: '#FCD34D',
    DEFAULT: '#F59E0B',
    dark: '#D97706',
    background: '#FEF3C7',
  },

  good: {
    light: '#6EE7B7',
    DEFAULT: '#10B981',
    dark: '#059669',
    background: '#ECFDF5',
  },

  // Special colors
  purple: {
    light: '#C084FC',
    DEFAULT: '#A855F7',
    dark: '#9333EA',
    background: '#F3E8FF',
  },

  blue: {
    light: '#60A5FA',
    DEFAULT: '#3B82F6',
    dark: '#2563EB',
    gradient: {
      from: 'rgba(59, 130, 246, 0.1)',
      to: 'rgba(168, 85, 247, 0.1)',
    },
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Badge colors
  badge: {
    critical: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

// Dark theme colors (for future implementation)
export const darkColors = {
  background: '#1A1A1A',
  foreground: '#FFFFFF',
  muted: '#2A2A2A',
  mutedForeground: '#9CA3AF',
  accent: '#2A2A2A',
  border: 'rgba(255, 255, 255, 0.1)',
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#000000',
  },
};
