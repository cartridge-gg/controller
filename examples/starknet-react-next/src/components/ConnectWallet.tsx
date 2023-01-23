import ControllerConnector from "@cartridge/connector";
import { useAccount, useConnectors } from "@starknet-react/core";
import { useCallback } from "react";

export function ConnectWallet() {
  const { available, connect, disconnect } = useConnectors();
  const { address } = useAccount();

  const controllerConnector = available[0] as ControllerConnector;

  return (
    <>
      {address && <p>Account: {address} </p>}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() =>
            address ? disconnect() : connect(controllerConnector)
          }
        >
          {address ? "Disconnect" : "Connect"}
        </button>
        <button
          onClick={async () => {
            const txnHash = await controllerConnector.issueStarterPack(
              "non-fungible-football"
            );
            if (!address) {
              connect(controllerConnector);
            }
          }}
        >
          Claim as {address ? "Logged in User" : "New User"}
        </button>
      </div>
    </>
  );
}
