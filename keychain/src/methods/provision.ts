import { ec } from "starknet";
import Controller from "utils/account";

const provision = () => async (
  address: string
) => {
  const keypair = ec.genKeyPair();
  const deviceKey = ec.getStarkKey(keypair);

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

  return deviceKey;
}

export default provision