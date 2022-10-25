import { split } from "@cartridge/controller";
import { ec } from "starknet";
import { calculateContractAddressFromHash, getSelectorFromName } from "starknet/utils/hash";
import { toBN } from "starknet/utils/number";
import { encodeShortString } from "starknet/utils/shortString";
import Controller from "utils/account";

const PROXY_CLASS = "0x793a374a266432184f68b29546d14fedfdcbe6346bc51bd34ad730e6ff914f3";
const ACCOUNT_CLASS = "0x00c06f5ddc49aed455e5034e2bbbc01f089cc1e71e63601359dce8bd36315d60";
const CONTROLLER_CLASS = "0x0409fed9d01f3fcd836f4481a94abe8d2095caa8ccdc407dc13514a831d04be2";
const ACCOUNT_ADDRESS = "0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf";

const register = () => async (
  username: string, credential: { x: string, y: string }
) => {
  const keypair = ec.genKeyPair();
  const deviceKey = ec.getStarkKey(keypair);

  const { x: x0, y: x1, z: x2 } = split(toBN(credential.x))
  const { x: y0, y: y1, z: y2 } = split(toBN(credential.y))

  const address = calculateContractAddressFromHash(
    encodeShortString(username),
    toBN(PROXY_CLASS),
    [
      toBN(ACCOUNT_CLASS),
      getSelectorFromName("initialize"),
      "9",
      toBN(CONTROLLER_CLASS),
      "7",
      x0,
      x1,
      x2,
      y0,
      y1,
      y2,
      toBN(deviceKey)
    ],
    toBN(ACCOUNT_ADDRESS),
  )

  const controller = new Controller(
    keypair,
    address,
  );
  controller.cache();
  controller.approve(
    "https://cartridge.gg",
    [],
    "0",
  );

  return { address, deviceKey };
}

export default register