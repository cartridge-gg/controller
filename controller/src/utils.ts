import equal from "fast-deep-equal";
import { Policy } from "./types";
import { GraphQLClient } from "graphql-request";
import { number, hash, shortString } from "starknet";
import BN from "bn.js";

export const ENDPOINT = process.env.NEXT_PUBLIC_API_URL!;

export const client = new GraphQLClient(ENDPOINT, { credentials: "include" });

export const PROXY_CLASS =
  "0x04be79b3904b4e2775fd706fa037610b41d8f8708ce298aac3a470badf68176d";

export const CLASS_HASHES = {
  ["0.0.1"]: {
    account:
      "0x079507b6068846a05500331e0b54f7b539f067c2003de1f4635fc9885a267144",
    controller:
      "0x0286a2ea79ee08506efcbc330efd2ae34e2f22b79ecd2fb9b86ce26d6a1dbece",
    legacyController:
      "0x58e648a242085d5ff1e8f92a6b91057826639a82b23798998d40b61a27bca85",
  },
  ["latest"]: {
    account:
      "0x627850d612539b1258f64f8d76b0392944bb2886ed891b93e2bff9223317a91",
    controller:
      "0x6bcb2ecc68f478bd0546c451a0820ce19e2d562e3cfcb5906eede15aa81cc42",
    legacyController:
      "0x58e648a242085d5ff1e8f92a6b91057826639a82b23798998d40b61a27bca85",
  },
};

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
