import Controller from "utils/controller";
import { Policy } from "@cartridge/controller";

export type FormValues = {
  username: string;
};

export type AuthProps = SignupProps | LoginProps;

type AuthBaseProps = {
  prefilledName?: string;
  origin?: string;
  policies?: Policy[];
  isSlot?: boolean;
  chainId: string;
  rpcUrl: string;
  onSuccess: (controller: Controller) => void;
};

export type SignupProps = AuthBaseProps & {
  onLogin: (username: string) => void;
};

export type LoginProps = AuthBaseProps & {
  onSignup: (username: string) => void;
};
