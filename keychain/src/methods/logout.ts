import Storage from "utils/storage";
import Controller from "utils/controller";

const logout = (origin: string) => () => {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  if (!Storage.get(`@admin/${origin}`)) {
    throw new Error("unauthorized");
  }

  return Storage.clear();
};

export default logout;
