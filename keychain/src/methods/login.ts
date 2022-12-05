import Storage from "utils/storage";
import Controller, { fetchUser } from "utils/account";
import { Call, defaultProvider, ec } from "starknet";
import WebauthnAccount, { formatAssertion } from "../utils/webauthn";
import { toBN } from "starknet/dist/utils/number";
import {
  calculateTransactionHash,
  transactionVersion,
} from "starknet/dist/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/dist/utils/transaction";
import { getSelector } from "starknet/utils/hash";
import base64url from "base64url";
import { StarknetChainId, ZERO } from "starknet/constants";
import { estimatedFeeToMaxFee } from "starknet/dist/utils/stark";
import { CONTROLLER_CLASS } from "utils/constants";

// const registerDevice = () => {
//   const calls: Call[] = [
//     {
//       contractAddress: address,
//       entrypoint: "executeOnPlugin",
//       calldata: [
//         CONTROLLER_CLASS,
//         getSelector("add_device_key"),
//         1,
//         deviceKey,
//       ],
//     },
//   ];
// }

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
      const controller = new Controller(defaultProvider, keypair, address, credentialId, options);
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
