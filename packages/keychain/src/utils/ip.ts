const IP_PROVIDERS = [
  "https://api.ipify.org?format=json",
  "https://ipinfo.io/json",
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  retries: number = MAX_RETRIES,
): Promise<string | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const { ip } = await res.json();
      if (ip) {
        return ip;
      }
      throw new Error("No IP in response");
    } catch {
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }
  return null;
};

/**
 * Get the client's public IP address
 * Tries multiple providers with retries before failing
 */
export const getClientIp = async (): Promise<string> => {
  for (const provider of IP_PROVIDERS) {
    const ip = await fetchWithRetry(provider);
    if (ip) {
      return ip;
    }
  }
  throw new Error("Failed to fetch client IP from all providers");
};
