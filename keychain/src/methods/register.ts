import { split } from "@cartridge/controller";
import { ec, hash, number, shortString, constants } from "starknet";

import Controller from "utils/controller";
import Storage from "utils/storage";
import selectors from "utils/selectors";
import { CLASS_HASHES, PROXY_CLASS } from "utils/hashes";
import BN from "bn.js";

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
    const address = computeAddress(
      username,
      { x0, x1, x2 },
      { y0, y1, y2 },
      deviceKey,
    );
    const controller = new Controller(keypair, address, credentialId);
    controller.store();
    Storage.set(selectors["0.0.3"].active(), address);

    return { address, deviceKey };
  };

const saveDeploy = (origin: string) => (hash: string) => {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  if (!Storage.get(selectors["0.0.3"].admin(controller.address, origin))) {
    throw new Error("unauthorized");
  }

  Storage.update(
    selectors["0.0.3"].deployment(
      controller.address,
      constants.StarknetChainId.TESTNET,
    ),
    { txnHash: hash },
  );
  return;
};

const computeAddress = (
  username: string,
  { x0, x1, x2 }: { x0: BN; x1: BN; x2: BN },
  { y0, y1, y2 }: { y0: BN; y1: BN; y2: BN },
  deviceKey: string,
) =>
  hash.calculateContractAddressFromHash(
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

export { computeAddress, register, saveDeploy };
