import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector"

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors[0] as unknown as CartridgeConnector;

  return (
    <>
      {address && <p>Account: {address} </p>}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            address ? disconnect() : connect({ connector });
          }}
        >
          {address ? "Disconnect" : "Connect"}
        </button>

        {address && (
          <div>
            <div>username: {connector.username()}</div>
            <div>address: {address}</div>
          </div>
        )}
      </div>
    </>
  );
}
