import { cloudStorage, openLink } from "@telegram-apps/sdk";
import { UnifiedBackend } from "src/session/backend";

/**
 * Implements the UnifiedBackend interface for Telegram storage operations.
 */
export class TelegramBackend implements UnifiedBackend {
  /**
   * Retrieves the value associated with the specified key from Telegram cloud storage.
   * @param key - The key to look up in the storage.
   * @returns A promise that resolves to the stored value as a string, or null if the key doesn't exist.
   */
  async get(key: string): Promise<string | null> {
    return await cloudStorage.getItem(key);
  }

  /**
   * Stores a key-value pair in Telegram cloud storage.
   * @param key - The key under which to store the value.
   * @param value - The value to be stored.
   * @returns A promise that resolves when the value has been successfully stored.
   */
  async set(key: string, value: string): Promise<void> {
    await cloudStorage.setItem(key, value);
  }

  /**
   * Removes the key-value pair associated with the specified key from Telegram cloud storage.
   * @param key - The key of the item to be removed.
   * @returns A promise that resolves when the item has been successfully removed.
   */
  async delete(key: string): Promise<void> {
    await cloudStorage.deleteItem(key);
  }

  /**
   * Opens the specified URL using Telegram's openLink function.
   * @param url - The URL to open.
   */
  openLink(url: string): void {
    openLink(url);
  }
}
