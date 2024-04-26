import { AllowedMethod } from "./types";

export class MissingMethods extends Error {
  missing: AllowedMethod[];

  constructor(missing: AllowedMethod[]) {
    super("missing methods");

    this.missing = missing;

    // because we are extending a built-in class
    Object.setPrototypeOf(this, MissingMethods.prototype);
  }
}
