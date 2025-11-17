// Storage Access API utility for requesting first-party storage access
export async function requestStorageAccess(): Promise<boolean> {
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
    // Request storage access - this MUST be called in a user gesture context
    await document.requestStorageAccess();
    console.log("[Storage Access] Request completed successfully");
    return true;
  } catch (error) {
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
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
}
