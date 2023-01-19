import equal from "fast-deep-equal";
import { Policy } from "./types";
import { GraphQLClient } from "graphql-request";
import { number, hash, shortString } from "starknet";
import BN from "bn.js";
import { PROXY_CLASS, CLASS_HASHES } from "@cartridge/controller/src/constants";

export const ENDPOINT = process.env.NEXT_PUBLIC_API_URL!;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policyA) =>
      b.some((policyB) => equal(policyB, policyA)) ? prev : [...prev, policyA],
    [] as Policy[]
  );
}

export const computeAddress = (
  username: string,
  { x0, x1, x2 }: { x0: BN; x1: BN; x2: BN },
  { y0, y1, y2 }: { y0: BN; y1: BN; y2: BN },
  deviceKey: string
) =>
  hash.calculateContractAddressFromHash(
    shortString.encodeShortString(username),
    number.toBN(PROXY_CLASS),
    [
      number.toBN(CLASS_HASHES["0.0.1"].account),
      hash.getSelectorFromName("initialize"),
      "9",
      number.toBN(CLASS_HASHES["0.0.1"].controller),
      "7",
      x0,
      x1,
      x2,
      y0,
      y1,
      y2,
      number.toBN(deviceKey),
    ],
    "0"
  );
