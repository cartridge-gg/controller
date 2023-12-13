import { split } from "@cartridge/controller";
import { ec, hash, shortString, stark } from "starknet";

import Controller from "utils/controller";
import { CLASS_HASHES, PROXY_CLASS } from "@cartridge/controller/src/constants";

const register =
  () =>
  async (
    username: string,
    credentialId: string,
    credential: { x: string; y: string },
  ) => {
    const privateKey = stark.randomAddress();
    const deviceKey = ec.starkCurve.getStarkKey(privateKey);

    const { x: x0, y: x1, z: x2 } = split(BigInt(credential.x));
    const { x: y0, y: y1, z: y2 } = split(BigInt(credential.y));
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
  { x0, x1, x2 }: { x0: bigint; x1: bigint; x2: bigint },
  { y0, y1, y2 }: { y0: bigint; y1: bigint; y2: bigint },
  deviceKey: string,
) =>
  hash.calculateContractAddressFromHash(
    shortString.encodeShortString(username),
    BigInt(PROXY_CLASS),
    [
      BigInt(CLASS_HASHES["0.0.1"].account),
      hash.getSelectorFromName("initialize"),
      "9",
      BigInt(CLASS_HASHES["0.0.1"].controller),
      "7",
      x0,
      x1,
      x2,
      y0,
      y1,
      y2,
      BigInt(deviceKey),
    ],
    "0",
  );

export { computeAddress, register };
