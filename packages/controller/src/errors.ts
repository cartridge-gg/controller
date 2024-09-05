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

export class NotReadyToConnect extends Error {
  constructor() {
    super("Not ready to connect");

    Object.setPrototypeOf(this, NotReadyToConnect.prototype);
  }
}
