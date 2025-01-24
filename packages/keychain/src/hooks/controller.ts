import { useCallback, useState, useEffect } from "react";
import Controller from "@/utils/controller";

export function useController(): {
  controller: Controller | undefined;
  setController: (controller?: Controller) => void;
} {
  // Remove window.controller as initial state
  const [controller, setControllerState] = useState<Controller | undefined>();

  // Add effect to sync with window.controller on mount
  useEffect(() => {
    setControllerState(window.controller);
  }, []);

  const setController = useCallback((newController?: Controller) => {
    if (newController) {
      window.controller = newController;
      setControllerState(newController);
    } else {
      window.controller?.disconnect();
      delete window.controller;
      setControllerState(undefined);
    }
  }, []);

  return { controller, setController };
}
