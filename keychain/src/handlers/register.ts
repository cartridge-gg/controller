import { ec } from "starknet";
import {
  Message,
  RegisterResponse,
  RegisterRequest,
} from "@cartridge/controller";
import Controller from "utils/account";

export async function deploy(
  controller: Controller,
  message: Message<RegisterRequest>,
) {
  const keypair = ec.genKeyPair();
  const publicKey = ec.getStarkKey(keypair);

  try {
    const {
      params: { username, address },
    } = message.payload as RegisterRequest;

    const controller = new Controller(
      username,
      keypair,
      address,
    );
    controller.cache();
    controller.approve(
      "https://cartridge.gg/",
      [],
      "0",
    );

    return {
      method: "register",
      result: { publicKey },
    } as RegisterResponse;
  } catch (error) {
    return {
      method: "register",
      error,
    } as RegisterResponse;
  }
}
