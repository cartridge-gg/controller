import Controller from "utils/controller";

export function username(origin: string) {
  return () => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      throw new Error("no controller");
    }

    return controller.username;
  };
}
