import Controller from "utils/controller";
import {
  constants,
  number,
  typedData,
  Signature,
} from "starknet";

import { Session } from "@cartridge/controller";
import { CONTROLLER_CLASS } from "utils/constants";

const signMessage =
  (controller: Controller, session: Session) =>
    async (td: typedData.TypedData, account: string): Promise<Signature> => {
      const sig = await controller.account(constants.StarknetChainId.MAINNET).signMessage(td);
      sig.unshift(
        number.toBN(CONTROLLER_CLASS).toString(),
      );
      return sig;
    };

export {
  signMessage,
};
