import { ConnectionCtx, SetDelegateCtx } from "./types";
import Controller from "utils/controller";

export function setDelegateFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (_: Controller, origin: string) => (account: string) => {
    return new Promise((resolve, reject) => {
      setContext({
        type: "set-delegate",
        origin,
        account,
        resolve,
        reject,
      } as SetDelegateCtx);
    });
  };
}

export function delegateAccount() {
  return async () => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    return await controller.delegateAccount();
  };
}
