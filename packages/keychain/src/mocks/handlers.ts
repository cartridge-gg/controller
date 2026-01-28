import { graphql, HttpResponse } from "msw";

const DEFAULT_EVM_ADDRESS = "0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const DEFAULT_CONTROLLER_ADDRESS = "0x01c0ffee254729296a45a3885639AC7E10F9d549";
const DEFAULT_PASSKEY_ID = "test-passkey-id";
const DEFAULT_PASSKEY_PUBLIC_KEY = "test-passkey-public-key";
const DEFAULT_PASSWORD_PUBLIC_KEY = "0x1234";
const DEFAULT_PASSWORD_ENCRYPTED_KEY = "cGFzc3dvcmQ="; // "password" in base64
const DEFAULT_CONTROLLER_CLASS_HASH =
  "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf";

const now = () => new Date().toISOString();

type SignerMetadata = {
  __typename: string;
  webauthn?: Array<{ id: string; publicKey: string; AAGUID?: string }>;
  eip191?: Array<{ provider: string; ethAddress: string }>;
  password?: Array<{ publicKey: string; encryptedPrivateKey: string }>;
};

type ControllerSigner = {
  createdAt: string;
  isRevoked: boolean;
  isOriginal: boolean;
  metadata: SignerMetadata;
};

const webauthnSigner = (): ControllerSigner => ({
  createdAt: now(),
  isRevoked: false,
  isOriginal: true,
  metadata: {
    __typename: "WebauthnCredentials",
    webauthn: [
      {
        id: DEFAULT_PASSKEY_ID,
        publicKey: DEFAULT_PASSKEY_PUBLIC_KEY,
        AAGUID: "test-aaguid",
      },
    ],
  },
});

const eip191Signer = (provider: string): ControllerSigner => ({
  createdAt: now(),
  isRevoked: false,
  isOriginal: true,
  metadata: {
    __typename: "Eip191Credentials",
    eip191: [
      {
        provider,
        ethAddress: DEFAULT_EVM_ADDRESS,
      },
    ],
  },
});

const passwordSigner = (): ControllerSigner => ({
  createdAt: now(),
  isRevoked: false,
  isOriginal: true,
  metadata: {
    __typename: "PasswordCredentials",
    password: [
      {
        publicKey: DEFAULT_PASSWORD_PUBLIC_KEY,
        encryptedPrivateKey: DEFAULT_PASSWORD_ENCRYPTED_KEY,
      },
    ],
  },
});

const signerMap: Record<string, ControllerSigner> = {
  webauthn: webauthnSigner(),
  password: passwordSigner(),
  google: eip191Signer("google"),
  discord: eip191Signer("discord"),
  walletconnect: eip191Signer("walletconnect"),
  metamask: eip191Signer("metamask"),
  rabby: eip191Signer("rabby"),
  "phantom-evm": eip191Signer("phantom-evm"),
};

const accountConfigs: Record<string, { address: string; signers: string[] }> = {
  "headless-passkey": {
    address: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
    signers: ["webauthn"],
  },
  "headless-evm": {
    address: "0x0fedcba9876543210fedcba9876543210fedcba9876543210fedcba98765",
    signers: ["metamask"],
  },
  "headless-password": {
    address: "0x00aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
    signers: ["password"],
  },
};

const buildSignersForUsername = (username: string): ControllerSigner[] => {
  const config = accountConfigs[username];
  if (config) {
    return config.signers.map((key) => signerMap[key]).filter(Boolean);
  }

  // Default: provide a webauthn + metamask signer
  return [signerMap.webauthn, signerMap.metamask];
};

const addressForUsername = (username: string) => {
  const config = accountConfigs[username];
  return config?.address ?? DEFAULT_CONTROLLER_ADDRESS;
};

export const handlers = [
  graphql.query("Controller", ({ variables }) => {
    const username = String(variables.username ?? "headless-user");
    const chainId = String(variables.chainId ?? "SN_SEPOLIA");
    const timestamp = now();

    return HttpResponse.json({
      data: {
        controller: {
          id: "controller-1",
          accountID: username,
          address: addressForUsername(username),
          network: chainId,
          constructorCalldata: [DEFAULT_CONTROLLER_CLASS_HASH],
          createdAt: timestamp,
          updatedAt: timestamp,
          signers: buildSignersForUsername(username),
        },
      },
    });
  }),
  graphql.query("Account", ({ variables }) => {
    const username = String(variables.username ?? "headless-user");
    return HttpResponse.json({
      data: {
        account: {
          username,
          credentials: {
            webauthn: [
              {
                id: DEFAULT_PASSKEY_ID,
                publicKey: DEFAULT_PASSKEY_PUBLIC_KEY,
              },
            ],
          },
          controllers: {
            edges: [
              {
                node: {
                  address: addressForUsername(username),
                  constructorCalldata: [DEFAULT_CONTROLLER_CLASS_HASH],
                  signers: [
                    {
                      type: "webauthn",
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
  }),
];
