import Controller from "utils/account";

import {
  DeployContractRequest,
  ExecuteRequest,
  Request,
  Response,
  Message,
  ConnectRequest,
  ProbeRequest,
  RegisterRequest,
  SignMessageRequest,
} from "@cartridge/controller";

import { execute } from "./execute";
import { connect } from "./connect";
import { deploy } from "./deploy";
import { probe } from "./probe";
import { register } from "./register";
import { sign } from "./sign";

export const onSDKMessage = async (
  message: Message<Request>,
): Promise<Response> => {
  const { origin: from, method } = message.payload;
  if (!from) {
    throw new Error("no `from` defined")
  }

  if (method === "connect") {
    return connect(from, message as Message<ConnectRequest>);
  } else if (method === "register") {
    return register(message as Message<RegisterRequest>);
  }

  const controller = Controller.fromStore();
  if (!controller) {
    return {
      method,
      error: "not connected",
    } as Response;
  }

  const approvals = controller.approval(from);
  if (!approvals) {
    return {
      method,
      error: "not connected",
    } as Response;
  }

  switch (method) {
    case "probe": {
      return probe(controller, message as Message<ProbeRequest>);
    }

    case "deploy-contract": {
      return deploy(controller, message as Message<DeployContractRequest>);
    }

    case "execute": {
      const {
        params: { id: executeId, calls, abis, transactionsDetail },
      } = message.payload as ExecuteRequest;

      // When `executeId` is not defined, don't wait for approvals.
      // We support both flows since opening a modal is only possible from
      // user interactions, otherwise the browser will block it.
      if (!executeId) {
        return execute(
          from,
          controller,
          calls,
          abis,
          transactionsDetail,
        );
      }

      const bc = new BroadcastChannel(executeId);

      return new Promise((resolve) => {
        bc.onmessage = async () => {
          resolve(
            await execute(
              from,
              controller,
              calls,
              abis,
              transactionsDetail,
            ),
          );
        };
      });
    }

    case "sign-message": {
      const {
        params: { id: signId },
      } = message.payload as SignMessageRequest;
      const bc = new BroadcastChannel(signId);

      return new Promise((resolve) => {
        bc.onmessage = async (msg) => {
          if (!msg.data.error) {
            resolve(
              await sign(controller, message as Message<SignMessageRequest>),
            );
          } else {
            resolve({ error: msg.data.error });
          }
        };
      });
    }
  }

  throw new Error("unknown method: " + method)
};
