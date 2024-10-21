import {
  FetchControllersDocument,
  FetchControllersQuery,
  FetchControllersQueryVariables,
} from "@cartridge/utils/api/cartridge";
import { ControllerAccounts } from "@cartridge/controller";
import pThrottle from "p-throttle";
import { addAddressPadding, validateAndParseAddress } from "starknet";
import { fetchData } from "utils/graphql";

const MAX_ADDRESSES = 1000;
const RATE_LIMIT = 1; // 1 requests per second
const INTERVAL = 1000; // 1 second

const cache: ControllerAccounts = {};

const throttledFetchData = pThrottle({
  limit: RATE_LIMIT,
  interval: INTERVAL,
  onDelay: () =>
    console.warn("Fetch controllers request delayed due to rate limiting"),
})((variables: FetchControllersQueryVariables) =>
  fetchData<FetchControllersQuery, FetchControllersQueryVariables>(
    FetchControllersDocument,
    variables,
  ),
);

export function fetchControllers(_: string) {
  return async (contractAddresses: string[]): Promise<ControllerAccounts> => {
    if (contractAddresses.length > MAX_ADDRESSES) {
      throw new Error(
        `Too many contract addresses. Maximum allowed: ${MAX_ADDRESSES}, Received: ${contractAddresses.length}`,
      );
    }

    const result: ControllerAccounts = {};
    const addressesToFetch: string[] = [];

    // Check cache and collect addresses that need to be fetched
    for (const addr of contractAddresses) {
      let validatedAddr = validateAndParseAddress(addr);
      if (validatedAddr in cache) {
        result[validatedAddr] = cache[validatedAddr];
      } else {
        addressesToFetch.push(validatedAddr);
      }
    }

    if (addressesToFetch.length > 0) {
      const response = await throttledFetchData({
        addresses: addressesToFetch.map((a) => {
          // api expects non-zero padded addresses
          return "0x" + a.slice(2).replace(/^0+/, "");
        }),
        first: MAX_ADDRESSES,
      });

      response.accounts?.edges?.forEach((edge) => {
        if (edge?.node?.controllers[0] && edge.node.id) {
          const addr = addAddressPadding(edge.node.controllers[0].address);
          result[addr] = edge.node.id;
          cache[addr] = edge.node.id;
        }
      });
    }

    return result;
  };
}
