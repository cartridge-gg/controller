import Controller from "utils/controller";

export interface AuthProps extends Props {
  fullPage?: boolean;
  onCancel: () => void;
}

export interface Props {
  onController: (controller: Controller) => void;
}
