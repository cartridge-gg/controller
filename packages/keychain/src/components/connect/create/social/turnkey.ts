import { TurnkeyIframeClient } from "@turnkey/sdk-browser";

export const getOrCreateWallet = async (
  subOrgId: string,
  userName: string,
  authIframeClient: TurnkeyIframeClient,
): Promise<string> => {
  const wallets = await authIframeClient.getWallets({
    organizationId: subOrgId,
  });
  if (wallets.wallets.length > 1 && !import.meta.env.DEV) {
    throw new Error(
      "Multiple wallets found" + JSON.stringify(wallets, null, 2),
    );
  }

  if (wallets.wallets.length === 1) {
    const wallet = await authIframeClient.getWalletAccount({
      organizationId: subOrgId,
      walletId: wallets.wallets[0].walletId,
    });
    return refineNonNull(wallet.account.address);
  }

  const createWalletResponse = await authIframeClient.createWallet({
    organizationId: subOrgId,
    walletName: userName,
    accounts: [WALLET_CONFIG],
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

const WALLET_CONFIG = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  path: "m/44'/60'/0'/0/0" as const,
  addressFormat: "ADDRESS_FORMAT_ETHEREUM" as const,
};
