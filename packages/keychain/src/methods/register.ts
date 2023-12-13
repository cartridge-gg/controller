import { split } from "@cartridge/controller";
import { ec, hash, number, shortString, stark } from "starknet";

import Controller from "utils/controller";
import { CLASS_HASHES, PROXY_CLASS } from "@cartridge/controller/src/constants";
import BN from "bn.js";

const register =
  () =>
  async (
    username: string,
    credentialId: string,
    credential: { x: string; y: string },
  ) => {
    const privateKey = stark.randomAddress();
    const deviceKey = ec.starkCurve.getStarkKey(privateKey);

    const { x: x0, y: x1, z: x2 } = split(number.toBN(credential.x));
    const { x: y0, y: y1, z: y2 } = split(number.toBN(credential.y));
    const address = computeAddress(
      username,
      { x0, x1, x2 },
      { y0, y1, y2 },
      deviceKey,
    );
    const controller = new Controller(privateKey, address, credentialId);
    controller.store();

    return { address, deviceKey };
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

export { computeAddress, register };
