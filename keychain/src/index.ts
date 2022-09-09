import Controller from "src/utils/account";

import {
  DeployContractRequest,
  ExecuteRequest,
  HashMessageRequest,
  Request,
  Response,
  VerifyMessageHashRequest,
  VerifyMessageRequest,
  Message,
  ConnectRequest,
  GetNonceRequest,
  ProbeRequest,
  SignMessageRequest,
} from "@cartridge/controller";

import { execute } from "./execute";
import { connect } from "./connect";
import { deploy } from "./deploy";
import { hash } from "./hash";
import { probe } from "./probe";
import { sign } from "./sign";
import { nonce } from "./nonce";
import { verify } from "./verify";
import { verifyHash } from "./verify-hash";

export const onSDKMessage = async (
  message: Message<Request>,
): Promise<Response> => {
  const { origin: from, method } = message.payload;
  if (!from) {
    throw new Error("no `from` defined")
  }

  if (method === "connect") {
    return connect(from, message as Message<ConnectRequest>);
  }

  const controller = await Controller.fromStore();
  if (!controller) {
    return {
      method,
      error: "not connected",
    } as Response;
  }

  const approvals = await controller.approval(from);
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
        params: { id: executeId, transactions, abis, transactionsDetail },
      } = message.payload as ExecuteRequest;

      // When `executeId` is not defined, don't wait for approvals.
      // We support both flows since opening a modal is only possible from
      // user interactions, otherwise the browser will block it.
      if (!executeId) {
        return execute(
          from,
          controller,
          transactions,
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
              transactions,
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

    // Public
    case "hash-message": {
      return hash(controller, message as Message<HashMessageRequest>);
    }

    // Public
    case "verify-message": {
      return verify(controller, message as Message<VerifyMessageRequest>);
    }

    // Public
    case "verify-message-hash": {
      return verifyHash(
        controller,
        message as Message<VerifyMessageHashRequest>,
      );
    }

    // Public
    case "get-nonce": {
      return nonce(controller, message as Message<GetNonceRequest>);
    }
  }

  throw new Error("unknown method: " + method)
};
