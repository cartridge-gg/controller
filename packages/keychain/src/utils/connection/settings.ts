import { ConnectionCtx, OpenSettingsCtx } from "./types";

export function openSettingsFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (account: string) =>
    new Promise((resolve, reject) => {
      setContext({
        type: "open-settings",
        origin,
        account,
        resolve,
        reject,
      } as OpenSettingsCtx);
    });
}
