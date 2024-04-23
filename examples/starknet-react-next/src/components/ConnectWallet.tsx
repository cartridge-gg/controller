import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors[0] as ControllerConnector;

  return (
    <>
      {address && <p>Account: {address} </p>}
      <div style={{ display: "flex", gap: "10px" }}>
        {address ? (
          <>
            <button onClick={() => disconnect()}>Disconnect</button>
            <button onClick={() => connector.logout()}>Logout</button>
          </>
        ) : (
          <button onClick={() => connect({ connector })}>Connect</button>
        )}
      </div>
    </>
  );
}
