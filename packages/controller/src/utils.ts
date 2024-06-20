import equal from "fast-deep-equal";
import { Policy } from "./types";
import { addAddressPadding } from "starknet";

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policyA) =>
      b.some((policyB) => equal(policyB, policyA)) ? prev : [...prev, policyA],
    [] as Policy[],
  );
}

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
