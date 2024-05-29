import { Connect } from "pages";
import Controller from "utils/controller";

export type FormValues = {
  username: string;
};

export type AuthProps = SignupProps | LoginProps;

type AuthBaseProps = {
  prefilledName?: string;
  context?: Connect;
  isSlot?: boolean;
  chainId: string;
  rpcUrl: string;
  onSuccess: (controller: Controller) => void;
};

export type SignupProps = AuthBaseProps & {
  onLogin: (username: string) => void;
};

export type LoginProps = AuthBaseProps & {
  chainId: string;
  rpcUrl: string;
  onSignup: (username: string) => void;
};
