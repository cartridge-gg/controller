import { constants } from "starknet";
import Controller from "utils/controller";

export type FormValues = {
  username: string;
};

export type AuthProps = SignupProps | LoginProps;

type AuthBaseProps = {
  fullPage?: boolean;
  prefilledName?: string;
  onController?: (controller: Controller) => void;
  onComplete?: () => void;
  // onCancel?: () => void;
};

export type SignupProps = AuthBaseProps & {
  starterPackId?: string;
  onLogin: (username: string) => void;
};

export type LoginProps = AuthBaseProps & {
  chainId?: constants.StarknetChainId;
  onSignup: (username: string) => void;
};
