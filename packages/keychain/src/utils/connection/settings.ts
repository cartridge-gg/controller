import { ConnectionCtx, OpenSettingsCtx } from "./types";
import Controller from "utils/controller";

export function openSettingsFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (_: Controller, origin: string) => (account: string) => {
    return new Promise((resolve, reject) => {
      setContext({
        type: "open-settings",
        origin,
        account,
        resolve,
        reject,
      } as OpenSettingsCtx);
    });
  };
}
