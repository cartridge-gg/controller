import { constants } from "starknet";
import selectors from "./selectors";
import Storage from "./storage";

const migrations = {
  ["0.0.2"]: {
    ["0.0.3"]: (address: string) => {
      Storage.set(
        selectors["0.0.3"].account(address),
        Storage.get(selectors["0.0.2"].account()),
      );
      Storage.remove(selectors["0.0.2"].account());

      Storage.set(
        selectors["0.0.3"].deployment(
          address,
          constants.StarknetChainId.SN_MAIN,
        ),
        Storage.get(
          selectors["0.0.2"].deployment(constants.StarknetChainId.SN_MAIN),
        ),
      );
      Storage.remove(
        selectors["0.0.2"].deployment(constants.StarknetChainId.SN_MAIN),
      );

      Storage.set(
        selectors["0.0.3"].deployment(
          address,
          constants.StarknetChainId.SN_GOERLI,
        ),
        Storage.get(
          selectors["0.0.2"].deployment(constants.StarknetChainId.SN_GOERLI),
        ),
      );
      Storage.remove(
        selectors["0.0.2"].deployment(constants.StarknetChainId.SN_GOERLI),
      );

      Storage.keys()
        .filter((k) => k.startsWith(selectors["0.0.2"].admin("")))
        .forEach((k) => {
          let [_, ...rest] = k.split("/");
          const origin = rest.join("/");
          Storage.set(
            selectors["0.0.3"].admin(address, origin),
            Storage.get(selectors["0.0.2"].admin(origin)),
          );
          Storage.remove(selectors["0.0.2"].admin(origin));
        });

      Storage.keys()
        .filter((k) => k.startsWith(selectors["0.0.2"].session("")))
        .forEach((k) => {
          let [_, ...rest] = k.split("/");
          const origin = rest.join("/");
          Storage.set(
            selectors["0.0.3"].session(address, origin),
            Storage.get(selectors["0.0.2"].session(origin)),
          );
          Storage.remove(selectors["0.0.2"].session(origin));
        });

      Storage.set(selectors["0.0.3"].active(), address);
      Storage.set("version", "0.0.3");
    },
  },
};

export default migrations;
