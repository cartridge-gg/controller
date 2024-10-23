import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { constants } from "starknet";
import equal from "fast-deep-equal";

import { Policy } from "@cartridge/controller";
import { normalizeOrigin } from "@cartridge/utils";

export function useUrlPolicys(): {
  chainId?: constants.StarknetChainId;
  isValidating: boolean;
  validPolicys: Policy[];
  invalidPolicys: Policy[];
  origin: string;
} {
  const router = useRouter();
  const [origin, setOrigin] = useState<string>();
  const [chainId, setChainId] = useState<constants.StarknetChainId>();
  const [isValidating, setIsValidating] = useState(true);
  const [validPolicys, setValidPolicys] = useState<Policy[]>([]);
  const [invalidPolicys, setInvalidPolicys] = useState<Policy[]>([]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { chainId, policies, origin } = router.query;
    if (!policies || !origin) {
      return;
    }

    setOrigin(normalizeOrigin(origin as string));
    setChainId(
      chainId
        ? (chainId as constants.StarknetChainId)
        : constants.StarknetChainId.SN_SEPOLIA,
    );

    setIsValidating(true);
    const requests = JSON.parse(policies as string) as Policy[];
    const requestDict = {};

    requests.forEach((policy) => {
      requestDict[policy.target] = requestDict[policy.target] || [];
      requestDict[policy.target].push(policy.method);
    });

    const promises = [];
    Object.keys(requestDict).forEach((target) => {
      promises.push(getValidPolicys(requestDict[target], target));
    });

    Promise.all(promises)
      .then((policies) => {
        policies = policies.flat();
        setValidPolicys(policies);
        setInvalidPolicys(diff(requests, policies));
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [router]);

  return { isValidating, chainId, validPolicys, invalidPolicys, origin };
}

async function getValidPolicys(
  methods: string[],
  target: string,
): Promise<Policy[]> {
  return methods.map((method) => ({ method, target }));
  // const validSelectors = await fetchSelectors(target);

  // // filters out invalid methods and duplicates
  // const validMethods = methods.filter(
  //   (method, index, arr) =>
  //     validSelectors.includes(getSelectorFromName(method)) &&
  //     arr.indexOf(method) === index,
  // );

  // return validMethods.map((method) => ({ method, target } as Policy));
}

// async function fetchSelectors(address: string): Promise<string[]> {
//   const res = await fetch(process.env.NEXT_PUBLIC_API!, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: SelectorsDocument,
//       variables: {
//         id: `starknet:${defaultProvider.chainId === StarknetChainId.SN_MAIN
//             ? "SN_MAIN"
//             : "SN_GOERLI"
//           }:${address}`,
//       },
//     }),
//   });

//   const json = await res.json();
//   return json.data.contract.policies.edges.map(({ node }) => node.selector);
// }

function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policyA) =>
      b.some((policyB) => equal(policyB, policyA)) ? prev : [...prev, policyA],
    [] as Policy[],
  );
}
