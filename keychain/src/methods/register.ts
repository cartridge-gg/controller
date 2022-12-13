import { split } from "@cartridge/controller";
import { ec, hash, KeyPair, number, shortString, constants } from "starknet";

import Controller from "utils/controller";
import { ACCOUNT_CLASS, CONTROLLER_CLASS, PROXY_CLASS } from "utils/constants";
import Storage from "utils/storage";
import selectors from "utils/selectors";

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
    Storage.set(selectors["0.0.3"].active(), address);

    return { address, deviceKey, keypair };
  };

//const saveDeploy = (origin: string) => (hash: string) => {
const saveDeploy = () => (hash: string) => {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  // if (!Storage.get(selectors["0.0.3"].admin(controller.address, origin))) {
  //   throw new Error("unauthorized");
  // }

  Storage.update(
    selectors["0.0.3"].deployment(
      controller.address,
      constants.StarknetChainId.TESTNET,
    ),
    { deployTx: hash },
  );
};

export { register, saveDeploy };
