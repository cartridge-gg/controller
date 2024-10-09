import { TypedData } from "starknet";
import { ConnectionCtx, SignMessageCtx } from "./types";

export function signMessageFactory(setContext: (ctx: ConnectionCtx) => void) {
  return (typedData: TypedData, account: string) => {
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
