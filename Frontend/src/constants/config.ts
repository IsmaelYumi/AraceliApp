export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AraceliApp',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  TOKEN_STORAGE_KEY: 'araceli_auth_token',
  USER_STORAGE_KEY: 'araceli_user_data',
  THEME_STORAGE_KEY: 'araceli_theme',
} as const;
