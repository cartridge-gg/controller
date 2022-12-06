import Storage from "utils/storage";
import Controller from "utils/controller";
import { ec } from "starknet";
import base64url from "base64url";
import { StarknetChainId } from "starknet/constants";

const login =
  () =>
    async (
      address: string,
      credentialId: string,
      options: {
        rpId?: string;
        challengeExt?: Buffer;
      },
    ) => {
      const keypair = ec.genKeyPair();
      const controller = new Controller(keypair, address, credentialId, options);
      const { assertion, invoke } = await controller.signAddDeviceKey(StarknetChainId.TESTNET);
      Storage.set(`@register/${StarknetChainId.MAINNET}/set_device_key`, invoke);

      return {
        assertion: {
          id: assertion.id,
          type: assertion.type,
          rawId: base64url(Buffer.from(assertion.rawId)),
          clientExtensionResults: assertion.getClientExtensionResults(),
          response: {
            authenticatorData: base64url(
              Buffer.from(assertion.response.authenticatorData),
            ),
            clientDataJSON: base64url(
              Buffer.from(assertion.response.clientDataJSON),
            ),
            signature: base64url(Buffer.from(assertion.response.signature)),
          },
        },
      };
    };

export default login;
