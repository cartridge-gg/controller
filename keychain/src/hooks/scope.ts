import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Scope } from "@cartridge/controller";
import { diff } from "utils/account";
import { defaultProvider } from "starknet";
import { getSelectorFromName } from "starknet/dist/utils/hash";
import { StarknetChainId } from "starknet/dist/constants";
// import { SelectorsDocument } from "generated/graphql";

export function useUrlScopes(): {
  isValidating: boolean;
  validScopes: Scope[];
  invalidScopes: Scope[];
} {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [validScopes, setValidScopes] = useState<Scope[]>([]);
  const [invalidScopes, setInvalidScopes] = useState<Scope[]>([]);

  useEffect(() => {
    const { scopes } = router.query;
    if (!router.isReady || !scopes) {
      return;
    }
    setIsValidating(true);
    const requests = JSON.parse(scopes as string);
    const requestDict = {};

    requests.forEach((scope) => {
      requestDict[scope.target] = requestDict[scope.target] || [];
      requestDict[scope.target].push(scope.method);
    });

    const promises = [];
    Object.keys(requestDict).forEach((target) => {
      promises.push(getValidScopes(requestDict[target], target));
    });

    Promise.all(promises)
      .then((scopes) => {
        scopes = scopes.flat();
        setValidScopes(scopes);
        setInvalidScopes(diff(requests, scopes));
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [router.isReady, router.query]);

  return { isValidating, validScopes, invalidScopes };
}

async function getValidScopes(
  methods: string[],
  target: string,
): Promise<Scope[]> {
  return
  // const validSelectors = await fetchSelectors(target);

  // // filters out invalid methods and duplicates
  // const validMethods = methods.filter(
  //   (method, index, arr) =>
  //     validSelectors.includes(getSelectorFromName(method)) &&
  //     arr.indexOf(method) === index,
  // );

  // return validMethods.map((method) => ({ method, target } as Scope));
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
//   return json.data.contract.scopes.edges.map(({ node }) => node.selector);
// }
