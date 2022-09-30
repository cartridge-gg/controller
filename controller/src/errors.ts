import { Scope } from "./types";

export class MissingScopes extends Error {
    missing: Scope[];

    constructor(missing: Scope[]) {
        super("missing scopes");

        this.missing = missing;

        // because we are extending a built-in class
        Object.setPrototypeOf(this, MissingScopes.prototype);
    }
}
