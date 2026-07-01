import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { controllerConnector } from "./StarknetProvider";

export function App() {
  const { account } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    if (!account) {
      setUsername(undefined);
      return;
    }
    controllerConnector.controller.username()?.then(setUsername);
  }, [account]);

  if (!account) {
    return (
      <button onClick={() => connect({ connector: controllerConnector })}>
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
