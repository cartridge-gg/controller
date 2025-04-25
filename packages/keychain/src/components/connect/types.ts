import { ExternalWalletType } from "@cartridge/controller";

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

export type AuthenticationMethod = "webauthn" | "social" | ExternalWalletType;
