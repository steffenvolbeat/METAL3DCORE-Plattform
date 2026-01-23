// 🎸 Storage Service
// LocalStorage & SessionStorage Wrapper

/**
 * LocalStorage Service
 */
export const storage = {
  /**
   * Speichert einen Wert
   */
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  },

  /**
   * Lädt einen Wert
   */
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return null;
    }
  },

  /**
   * Entfernt einen Wert
   */
  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  /**
   * Löscht alle Werte
   */
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },

  /**
   * Prüft ob Key existiert
   */
  has(key: string): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== null;
  },
};

/**
 * SessionStorage Service
 */
export const sessionStorage = {
  /**
   * Speichert einen Wert
   */
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;

    try {
      const serialized = JSON.stringify(value);
      window.sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to sessionStorage: ${error}`);
    }
  },

  /**
   * Lädt einen Wert
   */
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const item = window.sessionStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${error}`);
      return null;
    }
  },

  /**
   * Entfernt einen Wert
   */
  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key);
  },

  /**
   * Löscht alle Werte
   */
  clear(): void {
    if (typeof window === "undefined") return;
    window.sessionStorage.clear();
  },

  /**
   * Prüft ob Key existiert
   */
  has(key: string): boolean {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(key) !== null;
  },
};
