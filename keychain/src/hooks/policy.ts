import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Policy } from "@cartridge/controller";
import { diff } from "utils/account";
import { defaultProvider } from "starknet";
import { getSelectorFromName } from "starknet/dist/utils/hash";
import { StarknetChainId } from "starknet/dist/constants";
// import { SelectorsDocument } from "generated/graphql";

export function useUrlPolicys(): {
  isValidating: boolean;
  validPolicys: Policy[];
  invalidPolicys: Policy[];
} {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [validPolicys, setValidPolicys] = useState<Policy[]>([]);
  const [invalidPolicys, setInvalidPolicys] = useState<Policy[]>([]);

  useEffect(() => {
    const { policies } = router.query;
    if (!router.isReady || !policies) {
      return;
    }
    setIsValidating(true);
    const requests = JSON.parse(policies as string);
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
  }, [router.isReady, router.query]);

  return { isValidating, validPolicys, invalidPolicys };
}

async function getValidPolicys(
  methods: string[],
  target: string,
): Promise<Policy[]> {
  return methods.map(method => ({ method, target }))
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
//         id: `starknet:${defaultProvider.chainId === StarknetChainId.MAINNET
//             ? "SN_MAIN"
//             : "SN_GOERLI"
//           }:${address}`,
//       },
//     }),
//   });

//   const json = await res.json();
//   return json.data.contract.policies.edges.map(({ node }) => node.selector);
// }
