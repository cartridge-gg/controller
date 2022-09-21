import Controller from "utils/account";
import {
  Message,
  SignMessageResponse,
  SignMessageRequest,
} from "@cartridge/controller";

export async function sign(
  controller: Controller,
  message: Message<SignMessageRequest>,
) {
  try {
    const {
      params: { typedData },
    } = message.payload as SignMessageRequest;
    const signed = await controller.signMessage(typedData);
    return {
      method: "sign-message",
      result: signed,
    };
  } catch (error) {
    return {
      method: "sign-message",
      error,
    };
  }
}
