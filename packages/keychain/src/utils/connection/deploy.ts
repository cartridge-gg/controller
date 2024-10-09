import { ConnectionCtx, DeployCtx } from "./types";

export function deployFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (account: string) => {
    return new Promise((resolve, reject) => {
      setContext({
        type: "deploy",
        origin,
        account,
        resolve,
        reject,
      } as DeployCtx);
    });
  };
}
