import { ConnectionCtx, SetExternalOwnerCtx } from "./types";
import Controller from "utils/controller";

export function setExternalOwnerFactory(
  setContext: (ctx: ConnectionCtx) => void,
) {
  return (_: Controller, origin: string) => (account: string) => {
    return new Promise((resolve, reject) => {
      setContext({
        type: "set-external-owner",
        origin,
        account,
        resolve,
        reject,
      } as SetExternalOwnerCtx);
    });
  };
}

export function setExternalOwner(origin: string) {
  return async () => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      throw new Error("no controller");
    }

    // return await controller.delegateAccount();
  };
}
