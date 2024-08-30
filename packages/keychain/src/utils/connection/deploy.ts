import { ConnectionCtx, DeployCtx } from "./types";
import Controller from "utils/controller";

export function deployFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (_: Controller, origin: string) => (account: string) => {
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
