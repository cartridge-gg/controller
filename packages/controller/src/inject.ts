import { ControllerOptions } from "./";
import ControllerProvider from "./controller";

export class InjectedController extends ControllerProvider {
  constructor(options: ControllerOptions) {
    super(options);

    if (typeof window !== "undefined") {
      (window as any).starknet_controller = this;
    }
  }
}
