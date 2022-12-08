import { split } from "@cartridge/controller";
import { ec, hash, number, shortString } from "starknet";

import Controller from "utils/controller";
import { ACCOUNT_CLASS, CONTROLLER_CLASS, PROXY_CLASS } from "utils/constants";

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
        number.toBN(ACCOUNT_CLASS),
        hash.getSelectorFromName("initialize"),
        "9",
        number.toBN(CONTROLLER_CLASS),
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

export default register;
