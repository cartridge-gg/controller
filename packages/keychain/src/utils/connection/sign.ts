import {
  ConnectError,
  ControllerError,
  ResponseCodes,
} from "@cartridge/controller";
import { Signature, TypedData } from "starknet";
import { mutex } from "./sync";
import { parseControllerError } from "./execute";
import { generateCallbackId, storeCallbacks } from "./callbacks";

export interface SignMessageParams {
  id?: string;
  typedData: TypedData;
  account: string;
}

export function signMessageFactory(navigate: (path: string) => void) {
  return async (
    typedData: TypedData,
    account: string,
    async?: boolean,
  ): Promise<Signature | ConnectError> => {
    const controller = window.controller;

    if (!async) {
      return new Promise((resolve, reject) => {
        const id = generateCallbackId();
        const params: SignMessageParams = { id, typedData, account };

        // Store callbacks for retrieval by the route component
        storeCallbacks(id, { resolve, reject });

        // Navigate to sign-message route with data in URL params
        const searchParams = new URLSearchParams({
          data: encodeURIComponent(JSON.stringify(params)),
        });
        navigate(`/sign-message?${searchParams.toString()}`);
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
        // fallback to manual approval flow
        if (!(await controller.hasAuthorizedPoliciesForMessage(typedData))) {
          const id = generateCallbackId();
          const params: SignMessageParams = { id, typedData, account };

          // Store callbacks for retrieval by the route component
          storeCallbacks(id, { resolve, reject });

          // Navigate to sign-message route with data in URL params
          const searchParams = new URLSearchParams({
            data: encodeURIComponent(JSON.stringify(params)),
          });
          navigate(`/sign-message?${searchParams.toString()}`);

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
