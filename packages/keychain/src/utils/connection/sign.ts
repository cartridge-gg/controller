import { TypedData } from "starknet";
import { ConnectionCtx, SignMessageCtx } from "./types";
import Controller from "utils/controller";

export function signMessageFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (_: Controller, origin: string) =>
    (typedData: TypedData, account: string) => {
      return new Promise((resolve, reject) => {
        setContext({
          type: "sign-message",
          origin,
          typedData,
          account,
          resolve,
          reject,
        } as SignMessageCtx);
      });
    };
}
