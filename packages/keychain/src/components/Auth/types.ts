import { constants } from "starknet";
import Controller from "utils/controller";
import { ConnectCtx } from "hooks/connection";

export type FormValues = {
  username: string;
};

export type AuthProps = SignupProps | LoginProps;

type AuthBaseProps = {
  prefilledName?: string;
  context?: ConnectCtx;
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
