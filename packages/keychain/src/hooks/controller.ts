import { useEffect, useState } from "react";
import Controller from "utils/controller";

export function useController(): [
  controller: Controller,
  setter: (controller: Controller) => void,
] {
  const [controller, setController] = useState<Controller>();

  useEffect(() => {
    setController(Controller.fromStore());
  }, []);

  return [controller, setController];
}
