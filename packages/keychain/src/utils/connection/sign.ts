import {
  ConnectError,
  ControllerError,
  ResponseCodes,
} from "@cartridge/controller";
import { Signature, TypedData } from "starknet";
import { ConnectionCtx, SignMessageCtx } from "./types";
import Controller from "utils/controller";
import { parseControllerError } from "./execute";

export function signMessageFactory(setContext: (ctx: ConnectionCtx) => void) {
  return async (
    typedData: TypedData,
    account: string,
    async?: boolean,
  ): Promise<Signature | ConnectError> => {
    const controller = window.controller as Controller;

    if (!async) {
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
            message: (e as Error).message,
            error: parseControllerError(
              e as ControllerError & { code: number },
            ),
          });
        }
      },
    );
  };
}
