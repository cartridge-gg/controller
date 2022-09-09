import Controller from "src/utils/account";
import {
  Message,
  VerifyMessageResponse,
  VerifyMessageRequest,
} from "@cartridge/controller";

export async function verify(
  controller: Controller,
  message: Message<VerifyMessageRequest>,
) {
  try {
    const {
      params: { typedData, signature },
    } = message.payload as VerifyMessageRequest;
    const nonce = await controller.verifyMessage(typedData, signature);
    return {
      method: "verify-message",
      result: nonce,
    };
  } catch (error) {
    return {
      method: "verify-message",
      error,
    };
  }
}
