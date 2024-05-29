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
      Storage.set(selectors["0.0.3"].active(), address);
      Storage.set("version", "0.0.3");
    },
  },
};

export default migrations;
