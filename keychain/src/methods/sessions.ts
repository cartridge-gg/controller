import Controller from "utils/controller";
import selectors from "utils/selectors";
import Storage from "utils/storage";

const revoke = () => (origin: string) => {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  const session = controller.session(origin);
  if (!controller || !session) {
    throw new Error("not connected");
  }

  controller.revoke(origin);
};

const session = (origin: string) => () => {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  return controller.session(origin);
};

const sessions = (origin: string) => () => {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  if (!Storage.get(selectors["0.0.3"].admin(controller.address, origin))) {
    throw new Error("unauthorized");
  }

  return controller.sessions();
};

export { session, sessions, revoke };
