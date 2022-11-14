import Controller from "utils/account";
import {
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

export {
  signMessage,
};
