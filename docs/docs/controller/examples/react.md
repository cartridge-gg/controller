---
title: React
sidebar_position: 1
---

### Installation

Install the necessary packages:

```sh
# Using npm
npm install @cartridge/connector @cartridge/controller @starknet-react/core starknet

# Using yarn
yarn add @cartridge/connector @cartridge/controller @starknet-react/core starknet

# Using pnpm
pnpm add @cartridge/connector @cartridge/controller @starknet-react/core starknet
```

### Setting Up the Connector

Import the `CartridgeConnector` and create an instance:

```typescript
import CartridgeConnector from "@cartridge/connector";

const connector = new CartridgeConnector();
```

### Configuring the Connector

You can customize the `CartridgeConnector` by providing configuration options during instantiation. The `CartridgeConnector` accepts an options object that allows you to configure various settings such as policies, RPC URLs, theme, and more.

Here's an example:

```typescript
import CartridgeConnector from "@cartridge/connector";
import { shortString } from "starknet";

const ETH_TOKEN_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const connector = new CartridgeConnector({
  policies: [
    {
      target: ETH_TOKEN_ADDRESS,
      method: "approve",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
    {
      target: ETH_TOKEN_ADDRESS,
      method: "transfer",
    },
    // Add more policies as needed
  ],
  rpc: "https://api.cartridge.gg/x/starknet/sepolia",
  // Uncomment to use a custom theme
  // theme: "dope-wars",
  // colorMode: "light"
});
```

### Integrating with `StarknetProvider`

Wrap your application with the `StarknetConfig` and pass the connector:

```typescript
import { Chain, sepolia } from "@starknet-react/chains";
import { StarknetConfig, starkscan } from "@starknet-react/core";
import { RpcProvider } from "starknet";

function provider(chain: Chain) {
  return new RpcProvider({
    nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
  });
}

function App() {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={[connector]}
      explorer={starkscan}
      provider={provider}
    >
      {/* Your components */}
    </StarknetConfig>
  );
}
```

### Connecting a Wallet

Use the `useConnect`, `useDisconnect`, and `useAccount` hooks to manage wallet connections:

```typescript
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { useEffect, useState } from "react";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors[0] as CartridgeConnector;

  const [username, setUsername] = useState<string>();
  useEffect(() => {
    if (!address) return;
    connector.username()?.then((n) => setUsername(n));
  }, [address, connector]);

  return (
    <div>
      {address && (
        <>
          <p>Account: {address} </p>
          {username && <p>Username: {username}</p>}
        </>
      )}

      <button
        onClick={() => {
          address ? disconnect() : connect({ connector });
        }}
      >
        {address ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}
```

### Performing Transactions

Execute transactions using the `account` object from `useAccount` hook:

```typescript
import { useAccount, useExplorer } from "@starknet-react/core";
import { useCallback, useState } from "react";

const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const TransferEth = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account } = useAccount();
  const explorer = useExplorer();
  const [txnHash, setTxnHash] = useState<string>();

  const execute = useCallback(
    async (amount: string) => {
      if (!account) {
        return;
      }
      setSubmitted(true);
      setTxnHash(undefined);

      account
        .execute([
          {
            contractAddress: ETH_CONTRACT,
            entrypoint: "approve",
            calldata: [account?.address, amount, "0x0"],
          },
          {
            contractAddress: ETH_CONTRACT,
            entrypoint: "transfer",
            calldata: [account?.address, amount, "0x0"],
          },
        ])
        .then(({ transaction_hash }) => setTxnHash(transaction_hash))
        .catch((e) => console.error(e))
        .finally(() => setSubmitted(false));
    },
    [account],
  );

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Session Transfer Eth</h2>
      <p>Address: {ETH_CONTRACT}</p>
      <button onClick={() => execute("0x1C6BF52634000")} disabled={submitted}>
        Transfer 0.005 ETH to self
      </button>
      {txnHash && (
        <p>
          Transaction hash:{" "}
          <a
            href={explorer.transaction(txnHash)}
            target="_blank"
            rel="noreferrer"
          >
            {txnHash}
          </a>
        </p>
      )}
    </div>
  );
};
```
