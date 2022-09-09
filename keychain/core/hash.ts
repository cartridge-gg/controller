import { Controller } from "utils/wallet";
import {
  Message,
  HashMessageResponse,
  HashMessageRequest,
} from "@cartridge/controller";

export async function hash(
  controller: Controller,
  message: Message<HashMessageRequest>,
) {
  try {
    const {
      params: { typedData },
    } = message.payload as HashMessageRequest;
    const nonce = await controller.hashMessage(typedData);
    return {
      method: "hash-message",
      result: nonce,
    };
  } catch (error) {
    return {
      method: "hash-message",
      error,
    };
  }
}
