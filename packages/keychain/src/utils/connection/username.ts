import Controller from "utils/controller";

export function username() {
  return () => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    return controller.username;
  };
}
