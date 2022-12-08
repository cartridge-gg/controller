import { constants, defaultProvider } from "starknet";

const testnet =
  defaultProvider.chainId === constants.StarknetChainId.TESTNET ? "testnet." : "";
const baseUrl = `https://${testnet}starkscan.co/`;

export const StarkscanUrl = {
  [constants.StarknetChainId.MAINNET]: {
    transaction: (hash: string) => `https://starkscan.co/tx/${hash}`,
    contract: (address: string) =>
      `https://starkscan.co/contract/${address}`,
    message: (address: string) => `https://starkscan.co/message/${address}`,
    block: (id: string) => `https://starkscan.co/block/${id}`,
    event: (address: string) => `https://starkscan.co/event/${address}`,
    class: (address: string) => `https://starkscan.co/class/${address}`,
  },
  [constants.StarknetChainId.TESTNET]: {
    transaction: (hash: string) => `https://testnet.starkscan.co/tx/${hash}`,
    contract: (address: string) =>
      `https://testnet.starkscan.co/contract/${address}`,
    message: (address: string) => `https://testnet.starkscan.co/message/${address}`,
    block: (id: string) => `https://testnet.starkscan.co/block/${id}`,
    event: (address: string) => `https://testnet.starkscan.co/event/${address}`,
    class: (address: string) => `https://testnet.starkscan.co/class/${address}`,
  },
  [constants.StarknetChainId.TESTNET2]: {
    transaction: (hash: string) => `https://testnet-2.starkscan.co/tx/${hash}`,
    contract: (address: string) =>
      `https://testnet-2.starkscan.co/contract/${address}`,
    message: (address: string) => `https://testnet-2.starkscan.co/message/${address}`,
    block: (id: string) => `https://testnet-2.starkscan.co/block/${id}`,
    event: (address: string) => `https://testnet-2.starkscan.co/event/${address}`,
    class: (address: string) => `https://testnet-2.starkscan.co/class/${address}`,
  },
};

const DEFAULT_PORT_BY_PROTOCOL: { [index: string]: string } = {
  "http:": "80",
  "https:": "443",
};

const URL_REGEX = /^(https?:)?\/\/([^/:]+)?(:(\d+))?/;

const opaqueOriginSchemes = ["file:", "data:"];

/**
 * Converts a src value into an origin.
 */
export const normalize = (src: string): string => {
  if (src && opaqueOriginSchemes.find((scheme) => src.startsWith(scheme))) {
    // The origin of the child document is an opaque origin and its
    // serialization is "null"
    // https://html.spec.whatwg.org/multipage/origin.html#origin
    return "null";
  }

  // Note that if src is undefined, then srcdoc is being used instead of src
  // and we can follow this same logic below to get the origin of the parent,
  // which is the origin that we will need to use.

  const location = document.location;

  const regexResult = URL_REGEX.exec(src);
  let protocol: string;
  let hostname: string;
  let port: string;

  if (regexResult) {
    // It's an absolute URL. Use the parsed info.
    // regexResult[1] will be undefined if the URL starts with //
    protocol = regexResult[1] ? regexResult[1] : location.protocol;
    hostname = regexResult[2];
    port = regexResult[4];
  } else {
    // It's a relative path. Use the current location's info.
    protocol = location.protocol;
    hostname = location.hostname;
    port = location.port;
  }

  // If the port is the default for the protocol, we don't want to add it to the origin string
  // or it won't match the message's event.origin.

  const portSuffix =
    port && port !== DEFAULT_PORT_BY_PROTOCOL[protocol] ? `:${port}` : "";
  return `${protocol}//${hostname}${portSuffix}`;
};
