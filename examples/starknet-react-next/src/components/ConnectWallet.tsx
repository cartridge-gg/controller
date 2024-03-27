import ControllerConnector from "@cartridge/connector";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors[0];

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
        <button
          onClick={async () => {
            const _txnHash = await (
              connector as unknown as ControllerConnector
            ).issueStarterPack("influence");

            if (!address) {
              connect({ connector });
            }
          }}
        >
          Claim as {address ? "Logged in User" : "New User"}
        </button>
      </div>
    </>
  );
}
