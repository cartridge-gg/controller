import { Error, ResponseCodes } from "@cartridge/controller";

import { normalize as normalizeOrigin } from "utils/url";
import Controller from "utils/controller";

export function normalize<Promise>(
  fn: (origin: string) => Promise,
): (origin: string) => Promise {
  return (origin: string) => fn(normalizeOrigin(origin));
}

export function validate<T>(
  fn: (controller: Controller, origin: string) => T,
): (origin: string) => T | (() => Promise<Error>) {
  return (origin: string) => {
    const controller = Controller.fromStore();
    if (!controller) {
      return async () => ({
        code: ResponseCodes.NOT_CONNECTED,
        message: "Controller not found.",
      });
    }

    return fn(controller, origin);
  };
}
