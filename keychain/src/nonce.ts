import Controller from "src/utils/account";
import { Message, GetNonceResponse, GetNonceRequest } from "@cartridge/controller";

export async function nonce(
  controller: Controller,
  message: Message<GetNonceRequest>,
) {
  try {
    const nonce = await controller.getNonce();
    return {
      method: "get-nonce",
      result: nonce,
    };
  } catch (error) {
    return {
      method: "get-nonce",
      error,
    };
  }
}
