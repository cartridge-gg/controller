import Controller from "utils/account";
import { Abi, Call, DeclareSignerDetails, DeployAccountSignerDetails, InvocationsSignerDetails, Signature } from "starknet";
import { TypedData } from "starknet/utils/typedData";
import { Session } from "@cartridge/controller";

const signMessage = (controller: Controller, session: Session) => (typedData: TypedData, account: string): Promise<Signature> => {
  return controller.signMessage(typedData);
}

const signTransaction = (controller: Controller, session: Session) => async (
  calls: Call[],
  transactionsDetail: InvocationsSignerDetails,
  abis?: Abi[]
): Promise<Signature> => {
  return controller.signer.signTransaction(calls, transactionsDetail, abis);
}

const signDeclareTransaction = (controller: Controller, session: Session) => async (
  details: DeclareSignerDetails
): Promise<Signature> => {
  return controller.signer.signDeclareTransaction(details);
}

const signDeployAccountTransaction = (controller: Controller, session: Session) => async (
  transaction: DeployAccountSignerDetails
): Promise<Signature> => {
  return controller.signer.signDeployAccountTransaction(transaction);
}

export { signMessage, signTransaction, signDeployAccountTransaction, signDeclareTransaction }
