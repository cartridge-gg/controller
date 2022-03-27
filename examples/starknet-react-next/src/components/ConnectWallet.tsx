import { useMemo } from "react";
import { useStarknet } from "@starknet-react/core";

import { CartridgeConnector } from "./Connector";

export function ConnectWallet() {
  const { account, connect } = useStarknet();
  const cartridge = useMemo(() => new CartridgeConnector(), []);

  if (account) {
    return <p>Account: {account}</p>;
  }

  return <button onClick={() => connect(cartridge)}>Connect</button>;
}
