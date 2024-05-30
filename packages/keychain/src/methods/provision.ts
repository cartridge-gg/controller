import { ec, stark } from "starknet";
import Controller from "utils/controller";

const provision =
  () => async (address: string, username: string, credentialId: string) => {
    const privateKey = stark.randomAddress();
    const deviceKey = ec.starkCurve.getStarkKey(privateKey);
    const controller = new Controller(
      address,
      username,
      privateKey,
      credentialId,
    );
    controller.store();

    return deviceKey;
  };

export default provision;
