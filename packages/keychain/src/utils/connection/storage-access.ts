// Storage Access API utility for requesting first-party storage access
export async function requestStorageAccess(): Promise<boolean> {
  // Check if Storage Access API is supported
  if (typeof document === "undefined" || !document.requestStorageAccess) {
    return true;
  }

  try {
    await document.requestStorageAccess();
    return true;
  } catch {
    return false;
  }
}
