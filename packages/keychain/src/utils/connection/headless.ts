import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { doSignup } from "@/hooks/account";
import { fetchController } from "@/components/connect/create/utils";
import {
  decryptPrivateKey,
  encryptPrivateKey,
  generateStarknetKeypair,
} from "@/components/connect/create/password/crypto";
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
import { Owner, computeAccountAddress } from "@cartridge/controller-wasm";
import {
  Eip191Credentials,
  PasswordCredentials,
  SignerType,
  WebauthnCredentials,
  type ControllerQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { getAddress } from "ethers";
import { shortString } from "starknet";
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

type ExistingController = NonNullable<ControllerQuery["controller"]>;

type SignupOwner = {
  owner: Owner;
  registrationOwner: {
    type: SignerType | "password";
    credential: string;
  };
};

const resolveController = async (chainId: string, username: string) => {
  try {
    const result = await fetchController(chainId, username);
    return result?.controller;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "ent: controller not found" ||
        error.message === "Controller not found")
    ) {
      return undefined;
    }

    throw error;
  }
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
  isSignup = false,
}: {
  signers: ControllerSigners | undefined;
  provider: ExternalWalletType;
  connectWallet: (type: ExternalWalletType) => Promise<ExternalWalletResponse>;
  isSignup?: boolean;
}): Promise<Owner> => {
  const response = await connectWallet(provider);
  if (!response.success || !response.account) {
    throw new Error(response.error || "Failed to connect wallet");
  }

  if (
    !isSignup &&
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
  isSignup = false,
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

  if (!isSignup && !hasMatchingEip191Signer({ signers, address: account })) {
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
  isSignup = false,
}: {
  username: string;
  chainId: string;
  rpcUrl: string;
  provider: SocialProvider;
  signers: ControllerSigners | undefined;
  isSignup?: boolean;
}): Promise<Owner> => {
  const turnkeyWallet = new TurnkeyWallet(username, chainId, rpcUrl, provider);
  const { account, error, success } = await turnkeyWallet.connect(isSignup);

  if (!success || !account) {
    throw new Error(error || "Failed to connect to Turnkey");
  }

  window.keychain_wallets?.addEmbeddedWallet(
    account,
    turnkeyWallet as unknown as WalletAdapter,
  );

  if (!isSignup && !hasMatchingEip191Signer({ signers, address: account })) {
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

const loginToExistingController = async ({
  controllerQuery,
  owner,
  origin,
  rpcUrl,
}: {
  controllerQuery: ExistingController;
  owner: Owner;
  origin: string;
  rpcUrl: string;
}) => {
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

const loginWithSigner = async ({
  controllerQuery,
  signer,
  password,
  origin,
  chainId,
  rpcUrl,
  getParent,
}: {
  controllerQuery: ExistingController;
  signer: AuthOption;
  password?: string;
  origin: string;
  chainId: string;
  rpcUrl: string;
  getParent: () => HeadlessConnectParent | undefined;
}) => {
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
        username: controllerQuery.accountID,
        chainId,
        rpcUrl,
        provider: signer,
        signers,
      });
      break;
    default:
      throw new Error(`Unsupported headless signer: ${signer}`);
  }

  return loginToExistingController({
    controllerQuery,
    owner,
    origin,
    rpcUrl,
  });
};

const buildSignupOwner = async ({
  username,
  signer,
  password,
  chainId,
  rpcUrl,
  getParent,
}: {
  username: string;
  signer: AuthOption;
  password?: string;
  chainId: string;
  rpcUrl: string;
  getParent: () => HeadlessConnectParent | undefined;
}): Promise<SignupOwner> => {
  switch (signer) {
    case "password": {
      if (!password) {
        throw new Error("Password required for password authentication");
      }
      const { privateKey, publicKey } = generateStarknetKeypair();
      const encryptedPrivateKey = await encryptPrivateKey(privateKey, password);
      return {
        owner: {
          signer: {
            starknet: {
              privateKey,
            },
          },
        },
        registrationOwner: {
          type: "password",
          credential: JSON.stringify({
            public_key: publicKey,
            encrypted_private_key: encryptedPrivateKey,
          }),
        },
      };
    }
    case "metamask":
    case "rabby":
    case "phantom-evm": {
      const parent = getParent();
      if (!parent) {
        throw new Error("Wallet connection not ready");
      }
      const owner = await buildEip191Owner({
        signers: undefined,
        provider: signer,
        connectWallet: parent.externalConnectWallet,
        isSignup: true,
      });
      const address = owner.signer?.eip191?.address;
      if (!address) {
        throw new Error("Failed to connect wallet");
      }
      return {
        owner,
        registrationOwner: {
          type: SignerType.Eip191,
          credential: JSON.stringify({
            provider: signer,
            eth_address: address,
          }),
        },
      };
    }
    case "walletconnect": {
      const owner = await buildWalletConnectOwner(undefined, true);
      const address = owner.signer?.eip191?.address;
      if (!address) {
        throw new Error("Failed to connect to WalletConnect");
      }
      return {
        owner,
        registrationOwner: {
          type: SignerType.Eip191,
          credential: JSON.stringify({
            provider: signer,
            eth_address: address,
          }),
        },
      };
    }
    case "google":
    case "discord": {
      const owner = await buildSocialOwner({
        username,
        chainId,
        rpcUrl,
        provider: signer,
        signers: undefined,
        isSignup: true,
      });
      const address = owner.signer?.eip191?.address;
      if (!address) {
        throw new Error("Failed to connect to Turnkey");
      }
      return {
        owner,
        registrationOwner: {
          type: SignerType.Eip191,
          credential: JSON.stringify({
            provider: signer,
            eth_address: address,
          }),
        },
      };
    }
    default:
      throw new Error(`Unsupported headless signup signer: ${signer}`);
  }
};

const signupWithWebauthn = async ({
  username,
  chainId,
  rpcUrl,
}: {
  username: string;
  chainId: string;
  rpcUrl: string;
}) => {
  const registration = await doSignup(
    username,
    shortString.decodeShortString(chainId),
  );
  const {
    username: finalUsername,
    controllers,
    credentials,
  } = registration?.finalizeRegistration ?? {};
  if (!finalUsername) {
    throw new Error("Signup failed");
  }

  const credential = credentials?.webauthn?.[0];
  const controllerNode = controllers?.edges?.[0]?.node;
  if (!credential || !controllerNode) {
    throw new Error("WebAuthn signup failed");
  }

  const controller = await Controller.create({
    classHash: controllerNode.constructorCalldata[0],
    rpcUrl,
    address: controllerNode.address,
    username: finalUsername,
    owner: {
      signer: {
        webauthn: {
          rpId: import.meta.env.VITE_RP_ID!,
          credentialId: credential.id ?? "",
          publicKey: credential.publicKey ?? "",
        },
      },
    },
  });

  return controller;
};

const signupWithSigner = async ({
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
  if (signer === "webauthn") {
    return signupWithWebauthn({ username, chainId, rpcUrl });
  }

  const classHash = STABLE_CONTROLLER.hash;
  const { owner, registrationOwner } = await buildSignupOwner({
    username,
    signer,
    password,
    chainId,
    rpcUrl,
    getParent,
  });
  const salt = shortString.encodeShortString(username);
  const address = computeAccountAddress(classHash, owner, salt);

  const { controller, session } = await Controller.login({
    appId: origin,
    classHash,
    rpcUrl,
    address,
    username,
    owner,
    cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
    session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
    isControllerRegistered: false,
  });

  const registerRet = await controller.register({
    username,
    chainId: shortString.decodeShortString(chainId),
    owner: registrationOwner as {
      type: SignerType | "password";
      credential: string;
    },
    session: {
      expiresAt: session.expiresAt,
      guardianKeyGuid: session.guardianKeyGuid,
      metadataHash: session.metadataHash,
      sessionKeyGuid: session.sessionKeyGuid,
      allowedPoliciesRoot: session.allowedPoliciesRoot,
      authorization: session.authorization ?? [],
      appId: origin,
    },
  });

  if (!registerRet.register.username) {
    throw new Error("Signup failed");
  }

  return controller;
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
      const existingController = await resolveController(
        state.chainId,
        options.username,
      );
      const controller = existingController
        ? await loginWithSigner({
            controllerQuery: existingController,
            signer: options.signer,
            password: options.password,
            origin: effectiveOrigin,
            chainId: state.chainId,
            rpcUrl: state.rpcUrl,
            getParent,
          })
        : await signupWithSigner({
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
