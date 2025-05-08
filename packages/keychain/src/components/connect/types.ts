import { AuthOption } from "@cartridge/controller";
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

export function getControllerSignerProvider(
  signer: CredentialMetadata | undefined,
): AuthOption | undefined {
  if (!signer) {
    return undefined;
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
    default:
      throw new Error("Unknown controller signer");
  }
}

export function getControllerSignerAddress(
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
    default:
      throw new Error("Unknown controller signer provider");
  }
}
