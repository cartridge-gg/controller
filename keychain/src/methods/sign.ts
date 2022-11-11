import Controller from "utils/account";
import {
  Abi,
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
} from "starknet";
import { TypedData } from "starknet/utils/typedData";
import { Session } from "@cartridge/controller";
import { toBN } from "starknet/utils/number";
import { CONTROLLER_CLASS } from "utils/constants";

const signMessage =
  (controller: Controller, session: Session) =>
    async (typedData: TypedData, account: string): Promise<Signature> => {
      const sig = await controller.signMessage(typedData);
      sig.unshift(
        toBN(CONTROLLER_CLASS).toString(),
      );
      return sig;
    };

const signTransaction =
  (controller: Controller, session: Session) =>
    async (
      calls: Call[],
      transactionsDetail: InvocationsSignerDetails,
      abis?: Abi[],
    ): Promise<Signature> => {
      const sig = await controller.signer.signTransaction(
        calls,
        transactionsDetail,
        abis,
      );
      sig.unshift(
        toBN(CONTROLLER_CLASS).toString(),
      );
      return sig;
    };

const signDeclareTransaction =
  (controller: Controller, session: Session) =>
    async (details: DeclareSignerDetails): Promise<Signature> => {
      const sig = await controller.signer.signDeclareTransaction(details);
      sig.unshift(
        toBN(CONTROLLER_CLASS).toString(),
      );
      return sig;
    };

const signDeployAccountTransaction =
  (controller: Controller, session: Session) =>
    async (transaction: DeployAccountSignerDetails): Promise<Signature> => {
      const sig = await controller.signer.signDeployAccountTransaction(
        transaction,
      );
      sig.unshift(
        toBN(CONTROLLER_CLASS).toString(),
      );
      return sig;
    };

export {
  signMessage,
  signTransaction,
  signDeployAccountTransaction,
  signDeclareTransaction,
};
