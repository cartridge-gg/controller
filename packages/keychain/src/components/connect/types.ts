import { AuthOption } from "@cartridge/controller";
import { Signer } from "@cartridge/controller-wasm";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import { ec, encode } from "starknet";

export type FormInput = {
  username: string;
};

export type AuthProps = SignupProps | LoginProps;

type AuthBaseProps = {
  prefilledName?: string;
  isSlot?: boolean;
  onSuccess?: () => void;
};

export type SignupProps = AuthBaseProps & {
  onLogin: (username: string) => void;
};

export enum LoginMode {
  Webauthn, // client server login flow
  Controller, // client side only create session flow
}

export type LoginProps = AuthBaseProps & {
  mode?: LoginMode;
  onSignup: (username: string) => void;
};

export function credentialToAuth(
  signer: CredentialMetadata | undefined,
): AuthOption {
  if (!signer) {
    throw new Error("No signer provided");
  }
  // Cast to handle PasswordCredentials which may not be in the generated types yet
  const signerAny = signer as CredentialMetadata & {
    __typename?: string;
    eip191?: Array<{ provider: string }>;
  };
  switch (signerAny.__typename as string) {
    case "Eip191Credentials":
      return signerAny.eip191?.[0].provider as AuthOption;
    case "WebauthnCredentials":
      return "webauthn";
    case "SIWSCredentials":
      return "phantom";
    case "StarknetCredentials":
      return "argent";
    case "PasswordCredentials":
      return "password";
    default:
      throw new Error("Unknown controller signer");
  }
}

export function credentialToAddress(
  signer: CredentialMetadata | undefined,
): string | undefined {
  if (!signer) {
    return undefined;
  }
  // Cast to handle PasswordCredentials which may not be in the generated types yet
  const signerAny = signer as CredentialMetadata & {
    __typename?: string;
    eip191?: Array<{ ethAddress: string }>;
    siws?: Array<{ publicKey: string }>;
    starknet?: Array<{ publicKey: string }>;
    Password?: Array<{ publicKey: string }>;
  };
  switch (signerAny.__typename as string) {
    case "Eip191Credentials":
      return signerAny.eip191?.[0].ethAddress;
    case "SIWSCredentials":
      return signerAny.siws?.[0].publicKey;
    case "StarknetCredentials":
      return signerAny.starknet?.[0].publicKey;
    case "WebauthnCredentials":
      return undefined;
    case "PasswordCredentials":
      // Access the Password field
      return signerAny.Password?.[0]?.publicKey;
    default:
      throw new Error("Unknown controller signer provider");
  }
}

export function signerToAddress(signer: Signer): string {
  if (!signer) {
    throw new Error("No signer provided");
  }
  if (signer.eip191) {
    return signer.eip191?.address;
  } else if (signer.starknet) {
    // For password auth, we need to return the public key since it serves as the address
    // The password flow uses StarkNet signers
    // We'll get the public key from the privateKey
    const keyPair = ec.starkCurve.getStarkKey(signer.starknet.privateKey);
    return encode.addHexPrefix(keyPair);
  } else if (signer.webauthn) {
    throw new Error("Should not need to convert webauthn signer to address");
  } else {
    throw new Error("Unknown signer type");
  }
}
