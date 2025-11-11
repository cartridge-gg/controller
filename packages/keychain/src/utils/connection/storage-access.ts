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

// Storage Access API utility for requesting first-party storage access
export function requestStorageAccessFactory() {
  return async (): Promise<boolean> => {
    console.log("Requesting storage access...")
    // Check if Storage Access API is supported
    if (typeof document === "undefined" || !document.requestStorageAccess) {
      // Browser doesn't support Storage Access API
      // Return true as storage should be available
      return true;
    }

    try {
      // First check if we already have access
      if (document.hasStorageAccess) {
        const hasAccess = await document.hasStorageAccess();
        if (hasAccess) {
          return true;
        }
      }

      // Request storage access
      await document.requestStorageAccess();

      // Verify access was granted
      if (document.hasStorageAccess) {
        const hasAccess = await document.hasStorageAccess();
        return hasAccess;
      }

      return true;
    } catch (error) {
      console.error("Error requesting storage access:", error);
      // On error, return false
      return false;
    }
  };
}
