import Controller from "utils/account";
import { Message, ConnectRequest, ConnectResponse } from "@cartridge/controller";

const INTERNVAL = 100;

// Three minutes
const TIMEOUT = 1000 * 60 * 3;

export async function connect(from: string, message: Message<ConnectRequest>): Promise<ConnectResponse> {
  return new Promise((resolve, reject) => {
    let elapsed = -100;
    const checkApproval = async () => {
      elapsed += 100;

      if (elapsed > TIMEOUT) {
        clearInterval(timeout);
        return reject({
          method: "connect",
          error: "timeout",
        });
      }

      const controller = await Controller.fromStore();
      if (!controller) {
        return;
      }

      const approval = await controller.approval(from);
      if (approval) {
        clearInterval(timeout);
        return resolve({
          method: "connect",
          result: {
            success: true,
            scopes: approval.scopes,
            address: controller.address,
          },
        });
      }
    };

    // Poll for approval
    const timeout = setInterval(checkApproval, INTERNVAL);
    // Call on leading edge
    checkApproval();
  });
}
