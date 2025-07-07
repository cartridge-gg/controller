import { ConnectionCtx } from "./types";

export function navigateFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (path: string) =>
    new Promise<void>((resolve, reject) => {
      setContext({
        type: "navigate",
        path,
        resolve,
        reject,
      });
    });
}
