import { ResponseCodes } from "@cartridge/controller";

export function openSettingsFactory() {
  return () =>
    new Promise((resolve) => {
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

      resolve({
        code: ResponseCodes.SUCCESS,
        message: "Settings opened",
      });
    });
}
