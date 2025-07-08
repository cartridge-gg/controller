export function navigateFactory() {
  return (path: string) =>
    new Promise<void>((resolve) => {
      // Use native browser navigation within the iframe
      window.history.replaceState({}, "", path);

      // Dispatch a popstate event to trigger React Router to update
      window.dispatchEvent(new PopStateEvent("popstate"));

      resolve();
    });
}
