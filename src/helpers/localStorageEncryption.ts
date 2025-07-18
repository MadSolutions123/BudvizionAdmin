import CryptoJS from 'crypto-js';
import { LOCAL_STORAGE_ENCRYPTION_KEY, StorageKeys } from './constants';

// Token data interface
export interface TokenData {
  tokens:{
    access: {
      token: string;
      expires: string;
    } 
    refresh: {
      token: string;
      expires: string;
    }
  }
}

class LocalStorageEncryptionService {
  private encryptionKey: string;
  private isDevelopment: boolean;

  constructor() {
    this.encryptionKey = LOCAL_STORAGE_ENCRYPTION_KEY;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Encrypt data before storing
  private encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return data; // Fallback to unencrypted data
    }
  }

  // Decrypt data after retrieving
  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData; // Fallback to original data
    }
  }

  // Get development key with underscore prefix
  private getDevelopmentKey(key: StorageKeys): string {
    return `_${key}`;
  }

  // Generic method to set encrypted data
  setItem(key: StorageKeys, value: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Always save encrypted version
      const encryptedValue = this.encrypt(value);
      localStorage.setItem(key, encryptedValue);

      // In development mode, also save unencrypted version with underscore prefix
      if (this.isDevelopment) {
        const devKey = this.getDevelopmentKey(key);
        localStorage.setItem(devKey, value);
        console.log(`[DEV] Saved unencrypted data to localStorage key: ${devKey}`);
      }
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  // Generic method to get and decrypt data
  getItem(key: StorageKeys): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      return this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  // Remove item from storage
  removeItem(key: StorageKeys): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Remove encrypted version
      localStorage.removeItem(key);

      // In development mode, also remove unencrypted version
      if (this.isDevelopment) {
        const devKey = this.getDevelopmentKey(key);
        localStorage.removeItem(devKey);
        console.log(`[DEV] Removed unencrypted data from localStorage key: ${devKey}`);
      }
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  // Clear all storage
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Remove our app's encrypted keys
      Object.values(StorageKeys).forEach(key => {
        localStorage.removeItem(key);
        
        // In development mode, also remove unencrypted versions
        if (this.isDevelopment) {
          const devKey = this.getDevelopmentKey(key);
          localStorage.removeItem(devKey);
        }
      });

      if (this.isDevelopment) {
        console.log('[DEV] Cleared all encrypted and unencrypted localStorage data');
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Development helper: Get unencrypted value for debugging
  getUnencryptedItem(key: StorageKeys): string | null {
    if (typeof window === 'undefined' || !this.isDevelopment) return null;
    
    try {
      const devKey = this.getDevelopmentKey(key);
      return localStorage.getItem(devKey);
    } catch (error) {
      console.error('Error getting unencrypted localStorage item:', error);
      return null;
    }
  }

  // Development helper: List all our localStorage keys
  getAllKeys(): { encrypted: string[]; unencrypted: string[] } {
    if (typeof window === 'undefined') {
      return { encrypted: [], unencrypted: [] };
    }

    const encrypted: string[] = [];
    const unencrypted: string[] = [];

    Object.values(StorageKeys).forEach(key => {
      if (localStorage.getItem(key)) {
        encrypted.push(key);
      }
      
      if (this.isDevelopment) {
        const devKey = this.getDevelopmentKey(key);
        if (localStorage.getItem(devKey)) {
          unencrypted.push(devKey);
        }
      }
    });

    return { encrypted, unencrypted };
  }

  // New methods for token data object
  setTokenData(tokenData: TokenData): void {
    this.setItem(StorageKeys.AUTH_TOKEN, JSON.stringify(tokenData));
  }

  getTokenData(): TokenData | null {
    const data = this.getItem(StorageKeys.AUTH_TOKEN);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing token data:', error);
      return null;
    }
  }

  removeTokenData(): void {
    this.removeItem(StorageKeys.AUTH_TOKEN);
  }

  // Legacy methods for backward compatibility
  setAuthToken(token: string): void {
    console.warn('setAuthToken is deprecated, use setTokenData instead');
    const tokenData: TokenData = { tokens: { access: { token, expires: '' }, refresh: { token: '', expires: '' } } };
    this.setTokenData(tokenData);
  }

  getAuthToken(): string | null {
    console.warn('getAuthToken is deprecated, use getTokenData instead');
    const tokenData = this.getTokenData();
    return tokenData?.tokens.access.token || null;
  }

  removeAuthToken(): void {
    console.warn('removeAuthToken is deprecated, use removeTokenData instead');
    this.removeTokenData();
  }

  // Specific methods for user data
  setUserData(userData: object): void {
    this.setItem(StorageKeys.USER_DATA, JSON.stringify(userData));
  }

  getUserData<T = Record<string, unknown>>(): T | null {
    const data = this.getItem(StorageKeys.USER_DATA);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  removeUserData(): void {
    this.removeItem(StorageKeys.USER_DATA);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokenData = this.getTokenData();
    return !!(tokenData?.tokens.access.token);
  }

  // Development utility: Log current storage state
  logStorageState(): void {
    if (!this.isDevelopment) return;

    console.group('[DEV] LocalStorage State');
    
    const keys = this.getAllKeys();
    
    console.log('Encrypted keys:', keys.encrypted);
    console.log('Unencrypted keys (dev only):', keys.unencrypted);
    
    // Log actual values
    Object.values(StorageKeys).forEach(key => {
      const encryptedValue = localStorage.getItem(key);
      const unencryptedValue = this.getUnencryptedItem(key);
      
      if (encryptedValue || unencryptedValue) {
        console.group(`Key: ${key}`);
        console.log('Encrypted:', encryptedValue ? '***ENCRYPTED***' : 'null');
        console.log('Unencrypted (dev):', unencryptedValue || 'null');
        console.groupEnd();
      }
    });
    
    console.groupEnd();
  }
}

// Export singleton instance
export const localStorageEncryptionService = new LocalStorageEncryptionService();
export default localStorageEncryptionService; 