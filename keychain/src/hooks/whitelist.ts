import { useEffect, useState } from "react";

export const SIGNUP_WHITELIST = [
  "https://mu-mu.netlify.app",
  "https://mumu-onboarding.netlify.app",
  "https://game-goerli.influenceth.io",
];

export const WEB3AUTH_WHITELIST = ["https://game-goerli.influenceth.io"];

export const useWhitelist = (): {
  signupEnabled: boolean;
  web3AuthEnabled: boolean;
} => {
  const [signupEnabled, setSignupEnabled] = useState<boolean>(false);
  const [web3AuthEnabled, setWeb3AuthEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url =
        window.location != window.parent.location
          ? document.referrer
          : document.location.href;

      const domain = new URL(url);

      if (domain.hostname === "localhost") {
        setSignupEnabled(true);
        setWeb3AuthEnabled(true);
        return;
      }

      if (domain.hostname.endsWith("cartridge.gg")) {
        setSignupEnabled(true);
        setWeb3AuthEnabled(false);
        return;
      }

      // open signup
      setSignupEnabled(true);
      //setSignupEnabled(SIGNUP_WHITELIST.includes(domain.origin));
      setWeb3AuthEnabled(WEB3AUTH_WHITELIST.includes(domain.origin));
    }
  }, []);

  return {
    signupEnabled,
    web3AuthEnabled,
  };
};
