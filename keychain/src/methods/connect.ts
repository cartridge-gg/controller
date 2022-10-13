import { Policy } from "@cartridge/controller";

import Controller from "utils/account";

const INTERNVAL = 100;

// Three minutes
const TIMEOUT = 1000 * 60 * 3;

const connect = (origin: string) => (policies: Policy[]): Promise<{
  address: string;
  policies: Policy[];
}> => {
  return new Promise((resolve, reject) => {
    const controller = Controller.fromStore();
    if (!controller) {
      return reject("no controller");
    }

    let elapsed = -100;
    const checkApproval = async () => {
      elapsed += 100;

      if (elapsed > TIMEOUT) {
        clearInterval(timeout);
        return reject("timeout");
      }

      const session = controller.session(origin);
      if (session) {
        clearInterval(timeout);
        return resolve({
          policies: session.policies,
          address: controller.address,
        });
      }
    };

    // Poll for session
    const timeout = setInterval(checkApproval, INTERNVAL);

    // Call on leading edge
    checkApproval();
  });
}

export default connect;