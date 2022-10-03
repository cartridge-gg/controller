import { Scope } from "@cartridge/controller";

import Controller from "utils/account";

const INTERNVAL = 100;

// Three minutes
const TIMEOUT = 1000 * 60 * 3;

const connect = (origin: string) => (scopes: Scope[]): Promise<{
  address: string;
  scopes: Scope[];
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

      console.log(origin)
      const approval = controller.approval(origin);
      if (approval) {
        clearInterval(timeout);
        return resolve({
          scopes: approval.scopes,
          address: controller.address,
        });
      }
    };

    // Poll for approval
    const timeout = setInterval(checkApproval, INTERNVAL);

    // Call on leading edge
    checkApproval();
  });
}

export default connect;