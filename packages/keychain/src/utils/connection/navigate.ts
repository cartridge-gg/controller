// Navigation utility for programmatic navigation
export function navigateFactory() {
  return (path: string) =>
    new Promise<void>((resolve) => {
      // Store current path to detect when navigation completes
      const currentPath = window.location.pathname;

      // Create navigation state with initial depth
      // When navigating from outside the app (e.g., from controller),
      // we set navigationDepth to 1 to enable the back button
      const navigationState = {
        navigationDepth: 1,
        from: currentPath === "/" ? undefined : currentPath,
      };

      if (import.meta.env.DEV) {
        console.log(
          "[navigateFactory] Navigating from:",
          currentPath,
          "to:",
          path,
          "with state:",
          navigationState,
        );
      }

      // Dispatch a custom event with the navigation details
      // This allows React components to handle the navigation with proper state
      window.dispatchEvent(
        new CustomEvent("controller-navigate", {
          detail: {
            path,
            state: navigationState,
          },
        }),
      );

      // If path didn't change, resolve immediately
      if (currentPath === path) {
        if (import.meta.env.DEV) {
          console.log(
            "[navigateFactory] Path unchanged, resolving immediately",
          );
        }
        resolve();
        return;
      }

      // Wait for React to render the new route
      // Using double requestAnimationFrame to ensure rendering is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (import.meta.env.DEV) {
            console.log("[navigateFactory] Navigation complete");
          }
          resolve();
        });
      });
    });
}
