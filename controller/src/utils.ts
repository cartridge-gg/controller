import equal from "fast-deep-equal";

import { Scope } from "./types";

export function diff(a: Scope[], b: Scope[]): Scope[] {
    return a.reduce(
        (prev, scope) =>
            b.some((approval) => equal(approval, scope)) ? prev : [...prev, scope],
        [] as Scope[],
    );
}
