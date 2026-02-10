const CONTROLLER_WASM_STORAGE_KEYS = ["@cartridge/active"] as const;

const CONTROLLER_WASM_STORAGE_PREFIXES = [
  "@cartridge/account/",
  "@cartridge/session/",
  "@cartridge/policies/",
  "@cartridge/multi_chain/",
] as const;

function shouldRemoveControllerWasmKey(key: string) {
  if ((CONTROLLER_WASM_STORAGE_KEYS as readonly string[]).includes(key)) {
    return true;
  }

  return (CONTROLLER_WASM_STORAGE_PREFIXES as readonly string[]).some(
    (prefix) => key.startsWith(prefix),
  );
}

/**
 * Controller wasm persists account/session state in localStorage. Keychain
 * rehydrates it at boot via `ControllerFactory.fromStorage(...)`.
 *
 * On disconnect we must remove these keys so a subsequent connect cannot
 * resurrect the previous controller/session.
 */
export function clearControllerWasmStorage(storage: Storage | undefined) {
  if (!storage) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    if (shouldRemoveControllerWasmKey(key)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
}
