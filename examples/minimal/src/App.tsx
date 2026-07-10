import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-start/react";
import { controllerConnector } from "./StarknetProvider";

export function App() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    if (!address) {
      setUsername(undefined);
      return;
    }
    controllerConnector.controller.username()?.then(setUsername);
  }, [address]);

  if (!address) {
    const controllerWallet = connectors.find(
      (connector) => connector.name === controllerConnector.name,
    );
    return (
      <button
        disabled={!controllerWallet}
        onClick={() => connect({ connector: controllerWallet })}
      >
        Connect
      </button>
    );
  }

  return (
    <div>
      <p>Connected as {username ?? "..."}</p>
      <button
        onClick={() => controllerConnector.controller.openProfile("inventory")}
      >
        Inventory
      </button>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
