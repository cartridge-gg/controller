import { Policy } from "./types";

export class MissingPolicys extends Error {
  missing: Policy[];

  constructor(missing: Policy[]) {
    super("missing policies");

    this.missing = missing;

    // because we are extending a built-in class
    Object.setPrototypeOf(this, MissingPolicys.prototype);
  }
}
