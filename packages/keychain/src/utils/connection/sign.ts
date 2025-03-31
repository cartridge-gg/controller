import {
  ConnectError,
  ControllerError,
  ResponseCodes,
} from "@cartridge/controller";
import { Signature, TypedData } from "starknet";
import { ConnectionCtx, SignMessageCtx } from "./types";
import { mutex } from "./sync";
import { parseControllerError } from "./execute";

export function signMessageFactory(setContext: (ctx: ConnectionCtx) => void) {
  return async (
    typedData: TypedData,
    account: string,
    async?: boolean,
  ): Promise<Signature | ConnectError> => {
    const controller = window.controller;

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

    const release = await mutex.obtain();
    return await new Promise<Signature | ConnectError>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!controller) {
          return reject("Controller not connected");
        }

        // If a session call and there is no session available
        // fallback to manual apporval flow
        if (!(await controller.hasAuthorizedPoliciesForMessage(typedData))) {
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
    ).finally(() => {
      release();
    });
  };
}
