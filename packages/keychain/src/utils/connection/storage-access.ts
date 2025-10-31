// Storage Access API utility for checking first-party storage access
export function hasStorageAccessFactory() {
  return async (): Promise<boolean> => {
    // Check if Storage Access API is supported
    if (typeof document === "undefined" || !document.hasStorageAccess) {
      // Browser doesn't support Storage Access API
      // Assume access is available (e.g., Chrome without restrictions)
      return true;
    }

    try {
      // Check if we have storage access
      const hasAccess = await document.hasStorageAccess();
      return hasAccess;
    } catch (error) {
      console.error("Error checking storage access:", error);
      // On error, assume we don't have access
      return false;
    }
  };
}
