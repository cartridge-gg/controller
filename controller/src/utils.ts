import equal from "fast-deep-equal";
import { Policy } from "./types";
import { GraphQLClient } from "graphql-request";
import { ec, number, hash, shortString, Signature, Provider } from "starknet";
import BN from "bn.js";
import { PROXY_CLASS, CLASS_HASHES } from "./constants";
import { AccountDocument } from "./generated/graphql";
import { decode } from "cbor-x";

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


export const verifyMessageHash = async (
  provider: Provider,
  address: string,
  messageHash: number.BigNumberish,
  signature: Signature
) => {
  const isDeployed = !!provider.getClassHashAt(
    address,
    "latest"
  );

  if (isDeployed) {
    const res = await provider.callContract({
      contractAddress: address,
      entrypoint: "executeOnPlugin",
      calldata: [
        CLASS_HASHES["0.0.1"].controller,
        hash.getSelector("is_public_key"),
        "0x1",
        signature[0],
      ],
    });

    const isRegistered = res?.result[0] === "0x1";
    if (isRegistered) {
      const keyPair = ec.getKeyPairFromPublicKey(signature[0]);
      return ec.verify(
        keyPair,
        number.toBN(messageHash).toString(),
        signature
      );
    } else {
      // validate register txn and signature
    }
  } else {
    const res = await client.request(AccountDocument, {
      address,
    });

    const account = res?.accounts?.edges?.[0]?.node;
    if (!account) {
      return false;
    }

    const pubKeyCbor = decode(
      number.toBN(account.credential.publicKey).toBuffer()
    )[0];
    const x = number.toBN("0x" + pubKeyCbor[-2].toString("hex"));
    const y = number.toBN("0x" + pubKeyCbor[-3].toString("hex"));
    const { x: x0, y: x1, z: x2 } = split(x);
    const { x: y0, y: y1, z: y2 } = split(y);
    const computedAddress = computeAddress(
      account.id,
      { x0, x1, x2 },
      { y0, y1, y2 },
      signature[0]
    );
    if (computedAddress !== address) {
      throw new Error("invalid public key");
    }

    const keyPair = ec.getKeyPairFromPublicKey(signature[0]);
    return ec.verify(keyPair, number.toBN(messageHash).toString(), signature);
  }
};

const BASE = number.toBN(2).pow(number.toBN(86));

export function split(n: BN): {
  x: BN;
  y: BN;
  z: BN;
} {
  const x = n.mod(BASE);
  const y = n.div(BASE).mod(BASE);
  const z = n.div(BASE).div(BASE);
  return { x, y, z };
}