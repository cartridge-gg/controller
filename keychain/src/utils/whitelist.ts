export const WHITELIST_SITES = [
  "http://localhost",
  "https://mu-mu.netlify.app",
  "https://mumu-onboarding.netlify.app",
];

export const isWhitelisted = (redirect_uri: string): boolean => {
  if (!redirect_uri) {
    return false;
  }
  const searchParams = new URLSearchParams(
    redirect_uri.substring(redirect_uri.indexOf("?") + 1),
  );

  for (let i in WHITELIST_SITES) {
    if (searchParams.get("origin")?.includes(WHITELIST_SITES[i])) {
      return true;
    }
  }

  return false;
};
