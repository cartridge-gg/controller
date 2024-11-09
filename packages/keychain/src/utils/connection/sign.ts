import { ConnectError, ResponseCodes } from "@cartridge/controller";
import { Signature, TypedData } from "starknet";
import { ConnectionCtx, SignMessageCtx } from "./types";
import { mutex } from "./sync";
import Controller from "utils/controller";
import { parseControllerError } from "./execute";

export function signMessageFactory(setContext: (ctx: ConnectionCtx) => void) {
  return async (
    typedData: TypedData,
    account: string,
    sync?: boolean,
  ): Promise<Signature | ConnectError> => {
    const controller = window.controller as Controller;

    if (sync) {
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
    }

    const release = await mutex.obtain();
    return await new Promise<Signature | ConnectError>(
      async (resolve, reject) => {
        // If a session call and there is no session available
        // fallback to manual apporval flow
        if (!controller.hasSessionForMessage(typedData)) {
          setContext({
            type: "sign-message",
            origin,
            typedData,
            account,
            resolve,
            reject,
          } as SignMessageCtx);

          return resolve({
            code: ResponseCodes.USER_INTERACTION_REQUIRED,
            message: "User interaction required",
          });
        }

        try {
          const signature = await controller.signMessage(typedData);
          return resolve(signature);
        } catch (e) {
          return resolve({
            code: ResponseCodes.ERROR,
            message: e.message,
            error: parseControllerError(e),
          });
        }
      },
    ).finally(() => {
      release();
    });
  };
}
