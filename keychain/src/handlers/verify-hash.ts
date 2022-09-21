import Controller from "utils/account";
import {
  Message,
  VerifyMessageHashResponse,
  VerifyMessageHashRequest,
} from "@cartridge/controller";

export async function verifyHash(
  controller: Controller,
  message: Message<VerifyMessageHashRequest>,
) {
  try {
    const {
      params: { hash, signature },
    } = message.payload as VerifyMessageHashRequest;
    const nonce = await controller.verifyMessageHash(hash, signature);
    return {
      method: "verify-message-hash",
      result: nonce,
    };
  } catch (error) {
    return {
      method: "verify-message-hash",
      error,
    };
  }
}
