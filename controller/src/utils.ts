import equal from "fast-deep-equal";

import { Policy } from "./types";

export function diff(a: Policy[], b: Policy[]): Policy[] {
    return a.reduce(
        (prev, policyA) =>
            b.some((policyB) => equal(policyB, policyA)) ? prev : [...prev, policyA],
        [] as Policy[],
    );
}
