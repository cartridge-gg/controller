import { ec, stark } from "starknet";
import Controller from "utils/controller";

const provision = () => async (address: string, credentialId: string) => {
  const privateKey = stark.randomAddress();
  const deviceKey = ec.starkCurve.getStarkKey(privateKey);
  const controller = new Controller(privateKey, address, credentialId);
  controller.store();

  return deviceKey;
};

export default provision;
