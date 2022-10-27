import Storage from "utils/storage";
import Controller from "utils/account";
import { Call, ec } from "starknet";
import WebauthnAccount, { formatAssertion } from "../utils/webauthn";
import { toBN } from "starknet/dist/utils/number";
import { calculateTransactionHash, transactionVersion } from "starknet/dist/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/dist/utils/transaction";
import { getSelector } from "starknet/utils/hash";

const CONTROLLER_CLASS = "0x077007d85dd2466b2b29e626bac27ee017d7586f62511f4585dd596f33337ccf";

const login = () => async (address: string, credentialId: string, options: {
  rpId?: string
  challengeExt?: Buffer
}) => {
  const keypair = ec.genKeyPair();
  const deviceKey = ec.getStarkKey(keypair);
  const account = new WebauthnAccount(address, credentialId, deviceKey, options);
  const calls: Call[] = [
    {
      contractAddress: address,
      entrypoint: "executeOnPlugin",
      calldata: [CONTROLLER_CLASS, getSelector("add_device_key"), 1, deviceKey],
    },
  ];

  const nonce = await account.getNonce();
  const { suggestedMaxFee } = await account.estimateInvokeFee(calls, { nonce });
  const maxFee = suggestedMaxFee.toString();

  const version = toBN(transactionVersion);
  const chainId = await account.getChainId();

  const calldata = fromCallsToExecuteCalldata(calls);
  let msgHash = calculateTransactionHash(
    account.address,
    version,
    calldata,
    maxFee,
    chainId,
    nonce
  );

  let challenge = Buffer.from(
    msgHash.slice(2).padStart(64, "0").slice(0, 64),
    "hex",
  );

  if (options.challengeExt) {
    challenge = Buffer.concat([challenge, options.challengeExt])
  }

  const assertion = await account.signer.sign(challenge)
  const signature = formatAssertion(assertion)

  const receipt = await account.invokeFunction(
    { contractAddress: account.address, calldata, signature },
    {
      nonce,
      maxFee,
      version,
    }
  );

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
  Storage.set("@admin/https://cartridge.gg", {})

  return { assertion, transactionHash: receipt.transaction_hash }
}

export default login