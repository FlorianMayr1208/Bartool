import { useState, useEffect } from 'react';

export function usePersistentState<T>(
  key: string, 
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load from localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// Enhanced version with validation and migration support
export function usePersistentStateWithValidation<T>(
  key: string,
  defaultValue: T,
  validator?: (value: unknown) => value is T,
  migrator?: (oldValue: unknown) => T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultValue;
      
      const parsed = JSON.parse(saved);
      
      // Try validation first
      if (validator && validator(parsed)) {
        return parsed;
      }
      
      // Try migration if validator fails
      if (migrator) {
        try {
          const migrated = migrator(parsed);
          console.log(`🔄 Migrated localStorage key "${key}"`);
          return migrated;
        } catch (migrationError) {
          console.warn(`Migration failed for key "${key}":`, migrationError);
        }
      }
      
      // Fall back to default
      console.log(`🔧 Using default value for localStorage key "${key}"`);
      return defaultValue;
      
    } catch (error) {
      console.warn(`Failed to load from localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// Utility function to clear specific keys or all app data
export const localStorageUtils = {
  clearKey: (key: string) => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared localStorage key: ${key}`);
    } catch (error) {
      console.warn(`Failed to clear localStorage key "${key}":`, error);
    }
  },
  
  clearAll: (prefix = 'bartool-') => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Cleared ${keys.length} localStorage keys with prefix: ${prefix}`);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },
  
  getStorageSize: () => {
    try {
      const totalSize = Object.keys(localStorage)
        .map(key => localStorage.getItem(key)?.length || 0)
        .reduce((total, size) => total + size, 0);
      return Math.round(totalSize / 1024 * 100) / 100; // KB
    } catch (error) {
      console.warn('Failed to calculate localStorage size:', error);
      return 0;
    }
  }
};