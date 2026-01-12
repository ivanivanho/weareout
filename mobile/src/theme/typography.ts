/**
 * Typography System
 * Font sizes, weights, and line heights from design
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text styles for common UI elements
  styles: {
    // Headers
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    h4: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 24,
    },

    // Body text
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    bodySemibold: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 22,
    },

    // Small text
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    captionMedium: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
    },

    // Tiny text
    tiny: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },

    // Button text
    button: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    buttonSmall: {
      fontSize: 13,
      fontWeight: '600' as const,
      lineHeight: 18,
    },

    // Label text
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },

    // Time/status text
    time: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  },
};
