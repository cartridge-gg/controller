import {
  Call,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

import Controller from "utils/account";

const estimateFee = (origin: string) => async (transactions: Call | Call[], details?: EstimateFeeDetails): Promise<EstimateFee> => {
  const calls = Array.isArray(transactions) ? transactions : [transactions];

  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  const approvals = await controller.approval(origin);
  if (!controller || !approvals) {
    throw new Error("not connected")
  }

  return await controller.estimateFee(calls, details);
}

export default estimateFee;
