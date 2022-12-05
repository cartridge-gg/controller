import { ec, Provider } from "starknet";
import Controller from "utils/account";
import Storage from "utils/storage";

const provision = () => async (address: string, credentialId: string) => {
  const keypair = ec.genKeyPair();
  const deviceKey = ec.getStarkKey(keypair);

  const provider = new Provider({ sequencer: { network: "goerli-alpha" } });
  const controller = new Controller(provider, keypair, address, credentialId);
  controller.store();

  return deviceKey;
};

export default provision;
