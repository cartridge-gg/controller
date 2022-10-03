import { Approvals } from "@cartridge/controller";
import {
  Call,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

import Controller from "utils/account";

const estimateFee = (controller: Controller) => async (transactions: Call | Call[], details?: EstimateFeeDetails): Promise<EstimateFee> => {
  const calls = Array.isArray(transactions) ? transactions : [transactions];
  return await controller.estimateFee(calls, details);
}

export default estimateFee;
