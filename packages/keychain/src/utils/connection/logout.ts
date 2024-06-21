import Storage from "utils/storage";
import Controller from "utils/controller";
import { selectors, VERSION } from "utils/selectors";

export function logout(origin: string) {
  return () => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    if (!Storage.get(selectors[VERSION].admin(controller.address, origin))) {
      throw new Error("unauthorized");
    }

    return Storage.clear();
  };
}
