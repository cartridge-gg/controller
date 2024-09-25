import { addAddressPadding } from "starknet";

export type FormatAddressOptions = {
  first?: number;
  last?: number;
  size?: FormatAddressSize;
  padding?: boolean;
};

type FormatAddressSize = "sm" | "base" | "lg" | "full";

export function formatAddress(
  addr: string,
  { first, last, size = "base", padding = false }: FormatAddressOptions = {},
) {
  const full = padding ? addAddressPadding(addr) : addr;
  const { _first, _last } =
    first !== undefined || last !== undefined
      ? { _first: first ?? 0, _last: last ?? 0 }
      : { _first: sizeLen(size), _last: sizeLen(size) };

  return _first + _last === 0
    ? full
    : full.substring(0, _first) + "..." + full.substring(full.length - _last);
}

function sizeLen(size: FormatAddressSize) {
  switch (size) {
    case "sm":
      return 10;
    default:
    case "base":
      return 15;
    case "lg":
      return 20;
  }
}

export function normalize<Promise>(
  fn: (origin: string) => Promise,
): (origin: string) => Promise {
  return (origin: string) => fn(normalizeOrigin(origin));
}

const DEFAULT_PORT_BY_PROTOCOL: { [index: string]: string } = {
  "http:": "80",
  "https:": "443",
};

const URL_REGEX = /^(https?:)?\/\/([^/:]+)?(:(\d+))?/;

const opaqueOriginSchemes = ["file:", "data:"];

/**
 * Converts a src value into an origin.
 */
export function normalizeOrigin(src: string): string {
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
}
