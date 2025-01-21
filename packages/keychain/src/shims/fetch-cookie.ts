// Takes a fetch implementation and returns it unmodified
export default function fetchCookie(fetch: typeof globalThis.fetch) {
  return fetch;
}
