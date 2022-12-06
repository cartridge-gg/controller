import { ec } from "starknet";
import Controller from "utils/controller";

const provision = () => async (address: string, credentialId: string) => {
  const keypair = ec.genKeyPair();
  const deviceKey = ec.getStarkKey(keypair);
  const controller = new Controller(keypair, address, credentialId);
  controller.store();

  return deviceKey;
};

export default provision;
