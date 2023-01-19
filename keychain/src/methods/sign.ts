import Controller from "utils/controller";
import { constants, number, typedData, Signature } from "starknet";

import { Session } from "@cartridge/controller/";
import { CLASS_HASHES } from "@cartridge/controller/src/constants";

const signMessage =
  (controller: Controller, session: Session) =>
  async (td: typedData.TypedData, account: string): Promise<Signature> => {
    const sig = await controller
      .account(constants.StarknetChainId.MAINNET)
      .signMessage(td);
    sig.unshift(number.toBN(CLASS_HASHES["0.0.1"].controller).toString());
    return sig;
  };

export { signMessage };
