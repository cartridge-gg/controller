import { AuthOption } from "@cartridge/controller";
import { Signer } from "@cartridge/controller-wasm";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";

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

  switch (signer.__typename) {
    case "Eip191Credentials":
      return signer.eip191?.[0].provider as AuthOption;
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

  switch (signer.__typename) {
    case "Eip191Credentials":
      return signer.eip191?.[0].ethAddress;
    case "SIWSCredentials":
      return signer.siws?.[0].publicKey;
    case "StarknetCredentials":
      return signer.starknet?.[0].publicKey;
    case "WebauthnCredentials":
      return undefined;
    case "PasswordCredentials":
      // Access the password field (lowercase)
      return signer.password?.[0]?.publicKey;
    default:
      throw new Error("Unknown controller signer type");
  }
}

export function signerToAddress(signer: Signer): string {
  if (!signer) {
    throw new Error("No signer provided");
  }
  if (signer.eip191) {
    return signer.eip191?.address;
  } else if (signer.starknet) {
    throw new Error("Should not need to convert starknet signer to address");
  } else if (signer.webauthn) {
    throw new Error("Should not need to convert webauthn signer to address");
  } else {
    throw new Error("Unknown signer type");
  }
}
