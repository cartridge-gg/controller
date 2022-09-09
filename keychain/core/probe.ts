import { Controller } from "utils/wallet";
import { Message, ProbeResponse, ProbeRequest } from "@cartridge/controller";

export async function probe(
  controller: Controller,
  message: Message<ProbeRequest>,
) {
  return {
    method: "probe",
    result: {
      address: controller.address,
    },
  };
}
