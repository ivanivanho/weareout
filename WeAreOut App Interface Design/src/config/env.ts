/**
 * Environment Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a .env file in your project root
 * 2. Add the following variables:
 *    VITE_API_BASE_URL=http://localhost:3000/api
 *    VITE_GEMINI_API_KEY=your_gemini_api_key_here
 * 
 * For production, set these in your hosting environment (Vercel, Netlify, etc.)
 */

export const ENV = {
  // Backend API base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Gemini Vision API key (for receipt scanning and photo parsing)
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // App environment
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// Validate required environment variables
export function validateEnv() {
  const errors: string[] = [];
  
  if (!ENV.API_BASE_URL) {
    errors.push('VITE_API_BASE_URL is required');
  }
  
  if (!ENV.GEMINI_API_KEY && ENV.IS_PRODUCTION) {
    errors.push('VITE_GEMINI_API_KEY is required in production');
  }
  
  if (errors.length > 0) {
    console.error('Environment configuration errors:', errors);
    if (ENV.IS_PRODUCTION) {
      throw new Error('Missing required environment variables');
    }
  }
}
