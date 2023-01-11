import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/router";
import { useCallback } from "react";

export interface AnalyticsEvent {
  type:
  | "page_view"
  | "webauthn_create"
  | "webauthn_create_error"
  | "webauthn_login"
  | "webauthn_login_error"
  | "signup_cancel"
  | "login_cancel"
  | "quest_claim"
  | "logout";
  payload?: object;
}

export const useAnalytics = () => {
  const router = useRouter();
  const { address } = useAccount();
  const event = useCallback(
    ({ type, payload }: AnalyticsEvent) => {
      log(type, { address, path: router.pathname, ...payload });
    },
    [address, router],
  );

  return {
    event,
  };
};

const log = async (type: string, payload: object) => {
  if (process.env.NODE_ENV === "development") {
    return console.log(type, payload);
  }

  return await fetch("https://api.cartridge.gg/logs/analytics", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      userAgent: navigator.userAgent,
      ...payload,
    }),
  });
};
