import { ConnectionCtx, OpenMenuCtx } from "./types";
import Controller from "utils/controller";

export function openMenuFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (_: Controller, origin: string) => (account: string) => {
    return new Promise((resolve, reject) => {
      setContext({
        type: "open-menu",
        origin,
        account,
        resolve,
        reject,
      } as OpenMenuCtx);
    });
  };
}
