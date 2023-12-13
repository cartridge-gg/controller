import Storage from "utils/storage";
import Controller from "utils/controller";
import { constants, stark } from "starknet";
import base64url from "base64url";
import selectors from "utils/selectors";

const login =
  () =>
  async (
    address: string,
    chainId: constants.StarknetChainId,
    credentialId: string,
    options: {
      rpId?: string;
      challengeExt?: Buffer;
    },
  ) => {
    const privateKey = stark.randomAddress();
    const controller = new Controller(
      privateKey,
      address,
      credentialId,
      options,
    );

    const { assertion } = await controller.account(chainId).register();
    Storage.set(selectors["0.0.3"].active(), address);

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
      controller,
    };
  };

export default login;
