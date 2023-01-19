import { split } from "@cartridge/controller";
import { ec, hash, number, shortString, constants } from "starknet";

import Controller from "utils/controller";
import Storage from "utils/storage";
import selectors from "utils/selectors";
import { CLASS_HASHES, PROXY_CLASS } from "@cartridge/controller/src/constants";

const register =
  () =>
  async (
    username: string,
    credentialId: string,
    credential: { x: string; y: string },
  ) => {
    const keypair = ec.genKeyPair();
    const deviceKey = ec.getStarkKey(keypair);

    const { x: x0, y: x1, z: x2 } = split(number.toBN(credential.x));
    const { x: y0, y: y1, z: y2 } = split(number.toBN(credential.y));

    const address = hash.calculateContractAddressFromHash(
      shortString.encodeShortString(username),
      number.toBN(PROXY_CLASS),
      [
        number.toBN(CLASS_HASHES["0.0.1"].account),
        hash.getSelectorFromName("initialize"),
        "9",
        number.toBN(CLASS_HASHES["0.0.1"].controller),
        "7",
        x0,
        x1,
        x2,
        y0,
        y1,
        y2,
        number.toBN(deviceKey),
      ],
      "0",
    );

    const controller = new Controller(keypair, address, credentialId);
    controller.store();

    return { address, deviceKey };
  };

const setActive = (address: string, hash?: string) => {
  Storage.set(selectors["0.0.3"].active(), address);

  if (hash) {
    Storage.update(
      selectors["0.0.3"].deployment(address, constants.StarknetChainId.TESTNET),
      { txnHash: hash },
    );
  }
};

export { register, setActive };
