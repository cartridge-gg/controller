import { ec } from "starknet";
import Controller from "utils/account";
import Storage from "utils/storage";

const provision = () => async (address: string) => {
  const keypair = ec.genKeyPair();
  const deviceKey = ec.getStarkKey(keypair);

  const controller = new Controller(keypair, address);
  controller.cache();
  controller.approve("https://cartridge.gg", [], "0");
  Storage.set("@admin/https://cartridge.gg", {});

  return deviceKey;
};

export default provision;
