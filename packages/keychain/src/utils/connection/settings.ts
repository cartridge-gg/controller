import { ResponseCodes } from "@cartridge/controller";

export function openSettingsFactory() {
  return () =>
    new Promise((resolve) => {
      console.log("[openSettings] Starting navigation to /settings");
      console.log("[openSettings] Current location:", window.location.pathname);
      console.log(
        "[openSettings] Window.__resetNavigation exists:",
        !!(window as Window & { __resetNavigation?: () => void })
          .__resetNavigation,
      );

      window.dispatchEvent(
        new CustomEvent("controller-navigate", {
          detail: {
            path: "/settings",
            options: {
              resetStack: true,
            },
          },
        }),
      );

      console.log("[openSettings] Event dispatched");

      resolve({
        code: ResponseCodes.SUCCESS,
        message: "Settings opened",
      });
    });
}
