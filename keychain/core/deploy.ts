import { Controller } from "utils/wallet";
import {
  Message,
  DeployContractResponse,
  DeployContractRequest,
} from "@cartridge/sdk";

// TODO: Authenticate
export async function deploy(
  controller: Controller,
  message: Message<DeployContractRequest>,
) {
  try {
    const {
      params: { payload, abi },
    } = message.payload as DeployContractRequest;
    const response = await controller.deployContract(payload);
    return {
      method: "deploy-contract",
      result: response,
    } as DeployContractResponse;
  } catch (error) {
    return {
      method: "deploy-contract",
      error,
    } as DeployContractResponse;
  }
}
