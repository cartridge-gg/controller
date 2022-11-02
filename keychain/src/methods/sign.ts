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

const signMessage =
  (controller: Controller, session: Session) =>
  async (typedData: TypedData, account: string): Promise<Signature> => {
    const sig = await controller.signMessage(typedData);
    sig.unshift(
      "3364130956791496674817841690353332031228403084330511699766716352059223014607",
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
      "3364130956791496674817841690353332031228403084330511699766716352059223014607",
    );
    return sig;
  };

const signDeclareTransaction =
  (controller: Controller, session: Session) =>
  async (details: DeclareSignerDetails): Promise<Signature> => {
    const sig = await controller.signer.signDeclareTransaction(details);
    sig.unshift(
      "3364130956791496674817841690353332031228403084330511699766716352059223014607",
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
      "3364130956791496674817841690353332031228403084330511699766716352059223014607",
    );
    return sig;
  };

export {
  signMessage,
  signTransaction,
  signDeployAccountTransaction,
  signDeclareTransaction,
};
