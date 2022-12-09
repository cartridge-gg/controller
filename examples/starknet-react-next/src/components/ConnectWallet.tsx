import { useAccount, useConnectors } from "@starknet-react/core";

export function ConnectWallet() {
  const { available, connect, disconnect } = useConnectors()
  const { address } = useAccount();

  if (address) {
    return (
      <div>
        <p>Account: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return <button onClick={() => connect(available[0])}>Connect</button>;
}
