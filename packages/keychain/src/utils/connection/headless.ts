import { fetchController } from "@/components/connect/create/utils";
import { decryptPrivateKey } from "@/components/connect/create/password/crypto";
import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { ParsedSessionPolicies } from "@/hooks/session";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { SocialProvider } from "@/wallets/social/turnkey_utils";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import Controller from "@/utils/controller";
import {
  AuthOption,
  ExternalWalletResponse,
  ExternalWalletType,
  HeadlessConnectOptions,
  HeadlessConnectReply,
  ResponseCodes,
  WalletAdapter,
} from "@cartridge/controller";
import { Owner } from "@cartridge/controller-wasm";
import {
  Eip191Credentials,
  PasswordCredentials,
  WebauthnCredentials,
  type ControllerQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { getAddress } from "ethers";
import {
  createHeadlessApprovalRequest,
  hasPendingHeadlessApproval,
} from "./headless-requests";
import {
  createVerifiedSession,
  requiresSessionApproval,
} from "./session-creation";

export type HeadlessConnectionState = {
  origin?: string;
  chainId?: string;
  rpcUrl: string;
  policies?: ParsedSessionPolicies;
  isPoliciesResolved: boolean;
  isConfigLoading: boolean;
};

type ControllerSigners = NonNullable<
  NonNullable<ControllerQuery["controller"]>["signers"]
>;

export type HeadlessConnectParent = {
  open?: () => void | Promise<void>;
  close?: () => void | Promise<void>;
  onSessionCreated?: () => void | Promise<void>;
  externalConnectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse>;
};

type HeadlessConnectDependencies<Parent extends HeadlessConnectParent> = {
  setController: (controller?: Controller) => void;
  getParent: () => Parent | undefined;
  getConnectionState: () => HeadlessConnectionState;
};

const waitForConnectionReady = async (
  getConnectionState: () => HeadlessConnectionState,
) => {
  const timeoutMs = 10_000;
  const pollIntervalMs = 100;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const state = getConnectionState();
    if (
      state.origin &&
      state.chainId &&
      state.isPoliciesResolved &&
      !state.isConfigLoading
    ) {
      return state;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  return getConnectionState();
};

const buildWebauthnOwner = (signers?: ControllerSigners): Owner => {
  const credential = signers?.find(
    (signer) => signer.metadata.__typename === "WebauthnCredentials",
  )?.metadata as WebauthnCredentials | undefined;
  const webauthnCredential = credential?.webauthn?.[0];

  if (!webauthnCredential) {
    throw new Error("WebAuthn signer not found for controller");
  }

  return {
    signer: {
      webauthn: {
        rpId: import.meta.env.VITE_RP_ID!,
        credentialId: webauthnCredential.id ?? "",
        publicKey: webauthnCredential.publicKey ?? "",
      },
    },
  };
};

const buildPasswordOwner = async (
  signers: ControllerSigners | undefined,
  password?: string,
): Promise<Owner> => {
  if (!password) {
    throw new Error("Password required for password authentication");
  }

  const credential = signers?.find(
    (signer) => signer.metadata.__typename === "PasswordCredentials",
  )?.metadata as PasswordCredentials | undefined;
  const encryptedPrivateKey = credential?.password?.[0]?.encryptedPrivateKey;

  if (!encryptedPrivateKey) {
    throw new Error("Password signer not found for controller");
  }

  const privateKey = await decryptPrivateKey(encryptedPrivateKey, password);

  return {
    signer: {
      starknet: {
        privateKey,
      },
    },
  };
};

const hasMatchingEip191Signer = ({
  signers,
  provider,
  address,
}: {
  signers: ControllerSigners | undefined;
  provider?: string;
  address: string;
}) => {
  if (!signers) {
    return false;
  }

  let normalizedAddress: string;
  try {
    normalizedAddress = getAddress(address);
  } catch {
    return false;
  }

  return signers.some((signer) => {
    if (signer.metadata.__typename !== "Eip191Credentials") {
      return false;
    }

    const metadata = signer.metadata as Eip191Credentials;
    return (
      metadata.eip191?.some((credential) => {
        if (provider && credential.provider !== provider) {
          return false;
        }

        try {
          return getAddress(credential.ethAddress) === normalizedAddress;
        } catch {
          return false;
        }
      }) ?? false
    );
  });
};

const buildEip191Owner = async ({
  signers,
  provider,
  connectWallet,
}: {
  signers: ControllerSigners | undefined;
  provider: ExternalWalletType;
  connectWallet: (type: ExternalWalletType) => Promise<ExternalWalletResponse>;
}): Promise<Owner> => {
  const response = await connectWallet(provider);
  if (!response.success || !response.account) {
    throw new Error(response.error || "Failed to connect wallet");
  }

  if (
    !hasMatchingEip191Signer({
      signers,
      provider,
      address: response.account,
    })
  ) {
    throw new Error("Connected wallet does not match controller signer");
  }

  return {
    signer: {
      eip191: {
        address: getAddress(response.account),
      },
    },
  };
};

const buildWalletConnectOwner = async (
  signers: ControllerSigners | undefined,
): Promise<Owner> => {
  const walletConnectWallet = new WalletConnectWallet();
  const { success, account, error } =
    (await walletConnectWallet.connect()) as ExternalWalletResponse;

  if (!success || !account) {
    throw new Error("Failed to connect to WalletConnect: " + (error ?? ""));
  }

  window.keychain_wallets?.addEmbeddedWallet(
    account,
    walletConnectWallet as WalletAdapter,
  );

  if (
    !hasMatchingEip191Signer({
      signers,
      address: account,
    })
  ) {
    throw new Error("Connected wallet does not match controller signer");
  }

  return {
    signer: {
      eip191: {
        address: account,
      },
    },
  };
};

const buildSocialOwner = async ({
  username,
  chainId,
  rpcUrl,
  provider,
  signers,
}: {
  username: string;
  chainId: string;
  rpcUrl: string;
  provider: SocialProvider;
  signers: ControllerSigners | undefined;
}): Promise<Owner> => {
  const turnkeyWallet = new TurnkeyWallet(username, chainId, rpcUrl, provider);
  const { account, error, success } = await turnkeyWallet.connect(false);

  if (!success || !account) {
    throw new Error(error || "Failed to connect to Turnkey");
  }

  window.keychain_wallets?.addEmbeddedWallet(
    account,
    turnkeyWallet as unknown as WalletAdapter,
  );

  if (
    !hasMatchingEip191Signer({
      signers,
      address: account,
    })
  ) {
    throw new Error("Connected wallet does not match controller signer");
  }

  return {
    signer: {
      eip191: {
        address: account,
      },
    },
  };
};

const loginWithSigner = async ({
  username,
  signer,
  password,
  origin,
  chainId,
  rpcUrl,
  getParent,
}: {
  username: string;
  signer: AuthOption;
  password?: string;
  origin: string;
  chainId: string;
  rpcUrl: string;
  getParent: () => HeadlessConnectParent | undefined;
}) => {
  const controllerData = await fetchController(chainId, username);
  const controllerQuery = controllerData?.controller;

  if (!controllerQuery) {
    throw new Error("Controller not found");
  }

  const signers = controllerQuery.signers ?? undefined;

  let owner: Owner;

  switch (signer) {
    case "webauthn":
      owner = buildWebauthnOwner(signers);
      break;
    case "password":
      owner = await buildPasswordOwner(signers, password);
      break;
    case "metamask":
    case "rabby":
    case "phantom-evm": {
      const parent = getParent();
      if (!parent) {
        throw new Error("Wallet connection not ready");
      }
      owner = await buildEip191Owner({
        signers,
        provider: signer,
        connectWallet: parent.externalConnectWallet,
      });
      break;
    }
    case "walletconnect":
      owner = await buildWalletConnectOwner(signers);
      break;
    case "google":
    case "discord":
      owner = await buildSocialOwner({
        username,
        chainId,
        rpcUrl,
        provider: signer,
        signers,
      });
      break;
    default:
      throw new Error(`Unsupported headless signer: ${signer}`);
  }

  const loginRet = await Controller.login({
    appId: origin,
    classHash: controllerQuery.constructorCalldata[0],
    rpcUrl,
    address: controllerQuery.address,
    username: controllerQuery.accountID,
    owner,
    cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
    session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
    isControllerRegistered: true,
  });

  return loginRet.controller;
};

export const headlessConnect =
  <Parent extends HeadlessConnectParent>({
    setController,
    getParent,
    getConnectionState,
  }: HeadlessConnectDependencies<Parent>) =>
  (origin: string) =>
  async (options: HeadlessConnectOptions): Promise<HeadlessConnectReply> => {
    if (!options?.username || !options?.signer) {
      return {
        code: ResponseCodes.ERROR,
        message: "Headless connect requires username and signer",
      };
    }

    if (hasPendingHeadlessApproval()) {
      return {
        code: ResponseCodes.ERROR,
        message: "A headless approval is already pending",
      };
    }

    const state = await waitForConnectionReady(getConnectionState);
    const effectiveOrigin = state.origin ?? origin;
    if (!effectiveOrigin || !state.chainId) {
      return {
        code: ResponseCodes.ERROR,
        message: "Connection is not ready",
      };
    }

    try {
      const controller = await loginWithSigner({
        username: options.username,
        signer: options.signer,
        password: options.password,
        origin: effectiveOrigin,
        chainId: state.chainId,
        rpcUrl: state.rpcUrl,
        getParent,
      });

      window.controller = controller;
      setController(controller);

      if (!state.policies) {
        return {
          code: ResponseCodes.SUCCESS,
          address: controller.address(),
        };
      }

      if (!requiresSessionApproval(state.policies)) {
        await createVerifiedSession({
          controller,
          origin: effectiveOrigin,
          policies: state.policies,
        });
        return {
          code: ResponseCodes.SUCCESS,
          address: controller.address(),
        };
      }

      const request = createHeadlessApprovalRequest();

      return {
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        requestId: request.id,
      };
    } catch (error) {
      return {
        code: ResponseCodes.ERROR,
        message:
          error instanceof Error
            ? error.message
            : "Headless authentication failed",
      };
    }
  };
