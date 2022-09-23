import { useConnectors, useStarknet } from "@starknet-react/core";

export function ConnectWallet() {
  const { available, connect, disconnect } = useConnectors()
  const { account } = useStarknet();

  if (account) {
    return (
      <div>
        <p>Account: {account}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return <button onClick={() => connect(available[0])}>Connect</button>;
}
