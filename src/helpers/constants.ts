// API endpoints enum
export enum ApiEndpoints {
  // Auth endpoints
  LOGIN = 'api/v1/auth/login',
  SIGNUP = 'api/v1/auth/signup',
  LOGOUT = 'api/v1/auth/logout',
  REFRESH_TOKEN = 'api/v1/auth/refresh',
  CURRENT_USER = 'api/v1/auth/me',
  FORGOT_PASSWORD = 'api/v1/auth/forgot-password',
  RESET_PASSWORD = 'api/v1/auth/reset-password',
  GOOGLE_OAUTH = 'api/v1/auth/google',
  // Users endpoints
  GET_USERS = 'api/v1/users',
  // Streams endpoints
  GET_STREAMS = 'api/v1/stream-info'
}

// Storage keys enum (camelCase)
export enum StorageKeys {
  AUTH_TOKEN = 'authToken',
  USER_DATA = 'userData',
  APP_VERSION = 'appVersion',
}

// Encryption key - In production, this should come from environment variables
export const LOCAL_STORAGE_ENCRYPTION_KEY = (import.meta as any).env.VITE_APP_LOCAL_STORAGE_ENCRYPTION_KEY || 'your-secret-key-here-change-in-production'; 