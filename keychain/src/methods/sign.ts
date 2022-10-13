import Controller from "utils/account";
import { Signature } from "starknet";
import { TypedData } from "starknet/utils/typedData";

export function signMessage(typedData: TypedData, account: string): Promise<Signature> {
  const controller = Controller.fromStore();
  if (!controller) {
    throw new Error("no controller");
  }

  const session = controller.session(origin);
  if (!controller || !session) {
    throw new Error("not connected")
  }

  return controller.signMessage(typedData);
}
