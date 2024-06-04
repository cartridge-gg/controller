import { constants } from "starknet";
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
  onSuccess: (controller: Controller) => void;
};

export type SignupProps = AuthBaseProps & {
  onLogin: (username: string) => void;
};

export type LoginProps = AuthBaseProps & {
  chainId?: constants.StarknetChainId;
  onSignup: (username: string) => void;
};
