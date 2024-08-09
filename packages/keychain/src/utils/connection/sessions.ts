import Controller from "utils/controller";
import { selectors } from "utils/selectors";
import Storage from "utils/storage";

export function revoke() {
  return (origin: string) => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      throw new Error("no controller");
    }

    const session = controller.session(origin);
    if (!controller || !session) {
      throw new Error("not connected");
    }

    controller.revoke(origin);
  };
}

export function session(origin: string) {
  return () => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      throw new Error("no controller");
    }

    return controller.session(origin);
  };
}

export function sessions(origin: string) {
  return () => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      throw new Error("no controller");
    }

    if (!Storage.get(selectors["0.0.3"].admin(controller.address, origin))) {
      throw new Error("unauthorized");
    }

    return controller.sessions();
  };
}
