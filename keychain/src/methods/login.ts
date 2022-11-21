import Storage from "utils/storage";
import Controller from "utils/account";
import { Call, ec } from "starknet";
import WebauthnAccount, { formatAssertion } from "../utils/webauthn";
import { toBN } from "starknet/dist/utils/number";
import {
  calculateTransactionHash,
  transactionVersion,
} from "starknet/dist/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/dist/utils/transaction";
import { getSelector } from "starknet/utils/hash";
import base64url from "base64url";
import { ZERO } from "starknet/constants";
import { estimatedFeeToMaxFee } from "starknet/dist/utils/stark";
import { CONTROLLER_CLASS } from "utils/constants";

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
      const deviceKey = ec.getStarkKey(keypair);
      const account = new WebauthnAccount(
        address,
        credentialId,
        deviceKey,
        options,
      );
      const calls: Call[] = [
        {
          contractAddress: address,
          entrypoint: "executeOnPlugin",
          calldata: [
            CONTROLLER_CLASS,
            getSelector("add_device_key"),
            1,
            deviceKey,
          ],
        },
      ];

      const nonce = await account.getNonce();
      const version = toBN(transactionVersion);
      const chainId = await account.getChainId();

      const calldata = fromCallsToExecuteCalldata(calls);

      // const estimateMsgHash = calculateTransactionHash(
      //   account.address,
      //   version,
      //   calldata,
      //   ZERO,
      //   chainId,
      //   nonce,
      // );

      // let estimateChallenge = Uint8Array.from(estimateMsgHash.slice(2).padStart(64, "0").slice(0, 64).match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

      // if (options.challengeExt) {
      //   estimateChallenge = Buffer.concat([
      //     estimateChallenge,
      //     options.challengeExt,
      //   ]);
      // }

      // const estimateAssertion = await account.signer.sign(estimateChallenge);

      // const response = await account.getInvokeEstimateFee(
      //   {
      //     contractAddress: account.address,
      //     calldata,
      //     signature: formatAssertion(estimateAssertion),
      //   },
      //   { version, nonce },
      // );

      // const suggestedMaxFee = estimatedFeeToMaxFee(1000000);
      const suggestedMaxFee = 1000000;

      let msgHash = calculateTransactionHash(
        account.address,
        version,
        calldata,
        suggestedMaxFee,
        chainId,
        nonce,
      );

      let challenge = Uint8Array.from(msgHash.slice(2).padStart(64, "0").slice(0, 64).match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

      // if (options.challengeExt) {
      //   challenge = Buffer.concat([challenge, options.challengeExt]);
      // }

      const assertion = await account.signer.sign(challenge);
      const signature = formatAssertion(assertion);

      Storage.set("@transaction/set_device_key", [
        { contractAddress: account.address, calldata, signature },
        {
          nonce,
          maxFee: suggestedMaxFee,
          version,
        }])

      const controller = new Controller(keypair, address);
      controller.cache();
      controller.approve("https://cartridge.gg", [], "0");
      Storage.set("@admin/https://cartridge.gg", {});

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
