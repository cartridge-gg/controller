// Storage Access API utility for checking first-party storage access
export function hasStorageAccessFactory() {
  return async (): Promise<boolean> => {
    // Check if Storage Access API is supported
    if (typeof document === "undefined" || !document.hasStorageAccess) {
      console.log(
        "Storage Access API not supported - assuming access is available",
      );
      // Browser doesn't support Storage Access API
      // Assume access is available (e.g., Chrome without restrictions)
      return true;
    }

    try {
      // Check if we have storage access
      const hasAccess = await document.hasStorageAccess();
      console.log(`Storage access check result: ${hasAccess}`);
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
    console.log(
      "[Storage Access] Requesting storage access in iframe context...",
    );

    // Check if Storage Access API is supported
    if (typeof document === "undefined" || !document.requestStorageAccess) {
      console.log(
        "[Storage Access] Storage Access API not supported - assuming access is available",
      );
      // Browser doesn't support Storage Access API
      // Return true as storage should be available
      return true;
    }

    try {
      // First check if we already have access
      if (document.hasStorageAccess) {
        const hasAccess = await document.hasStorageAccess();
        if (hasAccess) {
          console.log(
            "[Storage Access] Already have storage access, no request needed",
          );
          return true;
        }
        console.log(
          "[Storage Access] Do not have storage access yet, requesting...",
        );
      }

      // Request storage access - this MUST be called in a user gesture context
      console.log(
        "[Storage Access] Calling document.requestStorageAccess()...",
      );
      await document.requestStorageAccess();
      console.log("[Storage Access] Request completed successfully");

      // Verify access was granted
      if (document.hasStorageAccess) {
        const hasAccess = await document.hasStorageAccess();
        console.log(
          `[Storage Access] Verification check: ${hasAccess ? "GRANTED" : "DENIED"}`,
        );
        return hasAccess;
      }

      console.log(
        "[Storage Access] Assuming storage access granted (no verification method available)",
      );
      return true;
    } catch (error) {
      // Provide detailed error information
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : "Unknown";

      console.error(
        `[Storage Access] Failed to request storage access: ${errorName} - ${errorMessage}`,
      );
      console.error("[Storage Access] Full error:", error);

      // Check for specific Safari errors
      if (
        errorMessage.includes("user gesture") ||
        errorMessage.includes("UserActivation")
      ) {
        console.error(
          "[Storage Access] Error: requestStorageAccess() must be called within a user gesture context",
        );
      } else if (errorMessage.includes("denied")) {
        console.error("[Storage Access] Error: User denied storage access");
      } else if (errorMessage.includes("NotAllowedError")) {
        console.error(
          "[Storage Access] Error: Storage access not allowed (may require user gesture or first-party interaction)",
        );
      }

      // On error, return false
      return false;
    }
  };
}
