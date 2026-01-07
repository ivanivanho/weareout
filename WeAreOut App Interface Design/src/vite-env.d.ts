/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_ENABLE_EMAIL_INTEGRATION?: string;
  readonly VITE_ENABLE_PHOTO_SCANNING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
