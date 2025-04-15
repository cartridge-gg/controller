import { TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { Signature } from "ethers";

export const signCreateControllerMessage = async (
  address: string,
  authIframeClient: TurnkeyIframeClient,
) => {
  const message = "Hello World!";
  const signedTx = await authIframeClient.signRawPayload({
    payload: eip191Encode(message),
    encoding: "PAYLOAD_ENCODING_TEXT_UTF8",
    hashFunction: "HASH_FUNCTION_SHA256",
    signWith: address,
  });

  const r = signedTx.r.startsWith("0x") ? signedTx.r : "0x" + signedTx.r;
  const s = signedTx.s.startsWith("0x") ? signedTx.s : "0x" + signedTx.s;

  const vNumber = parseInt(signedTx.v, 16);
  if (isNaN(vNumber) || (vNumber !== 0 && vNumber !== 1)) {
    throw new Error(`Invalid recovery ID (v) received: ${signedTx.v}`);
  }
  const normalizedV = Signature.getNormalizedV(vNumber);

  const signature = Signature.from({
    r,
    s,
    v: normalizedV,
  });

  return signature;
};

export const getOrCreateWallet = async (
  subOrgId: string,
  userName: string,
  authIframeClient: TurnkeyIframeClient,
) => {
  const wallets = await authIframeClient.getWallets({
    organizationId: subOrgId,
  });
  if (wallets.wallets.length > 1) {
    throw new Error(
      "Multiple wallets found" + JSON.stringify(wallets, null, 2),
    );
  }

  if (wallets.wallets.length === 1) {
    return wallets.wallets[0].walletId;
  }

  const createWalletResponse = await authIframeClient.createWallet({
    organizationId: subOrgId,
    walletName: userName,
    accounts: [walletConfig],
  });

  const address = refineNonNull(createWalletResponse.addresses[0]);
  return address;
};

function refineNonNull<T>(
  input: T | null | undefined,
  errorMessage?: string,
): T {
  if (input == null) {
    throw new Error(errorMessage ?? `Unexpected ${JSON.stringify(input)}`);
  }

  return input;
}

const walletConfig = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  path: "m/44'/60'/0'/0/0" as const,
  addressFormat: "ADDRESS_FORMAT_ETHEREUM" as const,
};

const eip191Encode = (message: string): string => {
  const encodedMessage = `\x19Ethereum Signed Message:\n${message.length}${message}`;
  return encodedMessage;
};
