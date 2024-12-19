import { useCallback } from "react";
import { useLocation } from "react-router-dom";

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
  const { pathname } = useLocation();
  const event = useCallback(
    ({ type, payload, address }: AnalyticsEvent) => {
      log(type, { address, path: pathname, ...payload });
    },
    [pathname],
  );

  return {
    event,
  };
};

const log = async (type: string, payload: object) => {
  if (import.meta.env.DEV) {
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
