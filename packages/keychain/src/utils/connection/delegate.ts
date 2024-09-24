import Controller from "utils/controller";

export function delegateAccount(origin: string) {
  return async () => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      throw new Error("no controller");
    }

    return await controller.delegateAccount();
  };
}
