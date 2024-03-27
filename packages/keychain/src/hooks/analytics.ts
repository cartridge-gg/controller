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
  address: string;
}

export const useAnalytics = () => {
  const router = useRouter();
  const event = useCallback(
    ({ type, payload, address }: AnalyticsEvent) => {
      log(type, { address, path: router.pathname, ...payload });
    },
    [router],
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
