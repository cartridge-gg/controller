import equal from "fast-deep-equal";
import { Policy } from "./types";
import {
  ec,
  hash,
  shortString,
  Signature,
  addAddressPadding,
  RpcProvider,
  BigNumberish,
  num,
} from "starknet";
import { PROXY_CLASS, CLASS_HASHES } from "./constants";
import { decode } from "cbor-x";

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policyA) =>
      b.some((policyB) => equal(policyB, policyA)) ? prev : [...prev, policyA],
    [] as Policy[],
  );
}

export const computeAddress = (
  username: string,
  { x0, x1, x2 }: { x0: bigint; x1: bigint; x2: bigint },
  { y0, y1, y2 }: { y0: bigint; y1: bigint; y2: bigint },
  deviceKey: string,
) =>
  hash.calculateContractAddressFromHash(
    shortString.encodeShortString(username),
    BigInt(PROXY_CLASS),
    [
      BigInt(CLASS_HASHES["0.0.1"].account),
      hash.getSelectorFromName("initialize"),
      "9",
      BigInt(CLASS_HASHES["0.0.1"].controller),
      "7",
      x0,
      x1,
      x2,
      y0,
      y1,
      y2,
      BigInt(deviceKey),
    ],
    "0",
  );

export const verifyMessageHash = async (
  provider: RpcProvider,
  address: string,
  messageHash: BigNumberish,
  signature: Signature,
) => {
  const isDeployed = !!provider.getClassHashAt(address, "latest");

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
      // TODO: #233
      return ec.starkCurve.verify(
        signature[0],
        num.toHex(messageHash),
        signature,
      );
    } else {
      const res = await provider.callContract(
        {
          contractAddress: address,
          entrypoint: "isValidSignature",
          calldata: [messageHash, signature.length, ...signature],
        },
        "latest",
      );

      return res?.result[0] === "0x1";
    }
  } else {
    const res = await (
      await fetch("https://api.cartridge.gg/query", {
        headers: {
          "content-type": "application/json",
        },
        body: `{\"query\":\"query Account($address: String!) {\\n  accounts(where: { contractAddress: $address }) {\\n    edges {\\n      node {\\n        id\\n        credential {\\n          id\\n          publicKey\\n        }\\n      }\\n    }\\n  }\\n}\\n\",\"variables\":{\"address\":\"${addAddressPadding(
          address,
        )}\"},\"operationName\":\"Account\"}`,
        method: "POST",
        mode: "cors",
        credentials: "omit",
      })
    ).json();

    const account = res?.accounts?.edges?.[0]?.node;
    if (!account) {
      return false;
    }

    // #223 bigint to buffer
    const pubKeyCbor = decode(
      BigInt(account.credential.publicKey).toBuffer(),
    )[0];
    const x = BigInt("0x" + pubKeyCbor[-2].toString("hex"));
    const y = BigInt("0x" + pubKeyCbor[-3].toString("hex"));
    const { x: x0, y: x1, z: x2 } = split(x);
    const { x: y0, y: y1, z: y2 } = split(y);
    const computedAddress = computeAddress(
      account.id,
      { x0, x1, x2 },
      { y0, y1, y2 },
      signature[0],
    );
    if (computedAddress !== address) {
      throw new Error("invalid public key");
    }

    return ec.starkCurve.verify(
      signature[0],
      BigInt(messageHash).toString(),
      signature,
    );
  }
};

export const getAccounts = async (addresses: string[]) => {
  const query = addresses.map((addr) => ({
    contractAddress: addAddressPadding(addr),
  }));

  const res = await (
    await fetch("https://api.cartridge.gg/query", {
      headers: {
        "content-type": "application/json",
      },
      body: `{\"query\":\"query AccountInfo($addresses: [AccountWhereInput!]!) {\\n  accounts(where: { or: $addresses}) {\\n    edges {\\n      node {\\n        id\\n  contractAddress\\n      }\\n    }\\n  }\\n}\",\"variables\":{\"addresses\":${JSON.stringify(
        query,
      )}},\"operationName\":\"AccountInfo\"}`,
      method: "POST",
      mode: "cors",
      credentials: "omit",
    })
  ).json();

  if (res.errors) {
    throw new Error(res.errors[0].message);
  }

  return res.accounts.edges.map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.id,
    profile_uri: `https://cartridge.gg/profile/${edge.node.contractAddress}`,
  }));
};

const BASE = 2n ** 86n;

export function split(n: bigint): {
  x: bigint;
  y: bigint;
  z: bigint;
} {
  const x = n % BASE;
  const y = (n / BASE) % BASE;
  const z = n / BASE / BASE;
  return { x, y, z };
}
