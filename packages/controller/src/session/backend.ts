/**
 * Represents a unified backend for storage operations and link handling.
 */
export interface UnifiedBackend {
  /**
   * Retrieves the value associated with the specified key.
   * @param key - The key to look up in the storage.
   * @returns A promise that resolves to the stored value as a string, or null if the key doesn't exist.
   */
  get: (key: string) => Promise<string | null>;

  /**
   * Stores a key-value pair in the storage.
   * @param key - The key under which to store the value.
   * @param value - The value to be stored.
   * @returns A promise that resolves when the value has been successfully stored.
   */
  set: (key: string, value: string) => Promise<void>;

  /**
   * Removes the key-value pair associated with the specified key from the storage.
   * @param key - The key of the item to be removed.
   * @returns A promise that resolves when the item has been successfully removed.
   */
  delete: (key: string) => Promise<void>;

  /**
   * Opens the specified URL.
   * @param url - The URL to open.
   */
  openLink: (url: string) => void;
}

/**
 * Implements a local storage backend that conforms to the UnifiedBackend interface.
 */
export class LocalStorageBackend {
  /**
   * Retrieves the value associated with the specified key from local storage.
   * @param key - The key to look up in local storage.
   * @returns A promise that resolves to the stored value as a string, or null if the key doesn't exist.
   */
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  /**
   * Stores a key-value pair in local storage.
   * @param key - The key under which to store the value.
   * @param value - The value to be stored.
   * @returns A promise that resolves when the value has been successfully stored.
   */
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  /**
   * Removes the key-value pair associated with the specified key from local storage.
   * @param key - The key of the item to be removed.
   * @returns A promise that resolves when the item has been successfully removed.
   */
  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  /**
   * Opens the specified URL in a new tab or window.
   * @param url - The URL to open.
   */
  openLink(url: string): void {
    window.open(url, "_blank");
  }
}
