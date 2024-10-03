---
title: starknet-react
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

Import the `ControllerConnector` and create an instance:

```typescript
import ControllerConnector from "@cartridge/connector";

const connector = new ControllerConnector();
```

### Configuring the Connector

You can customize the `ControllerConnector` by providing configuration options during instantiation. The `ControllerConnector` accepts an options object of type `ControllerOptions` that allows you to configure various settings such as policies, RPC URLs, theme, and more.

Here's an example:

```typescript
import ControllerConnector from "@cartridge/connector";
import { Policy } from "@cartridge/controller";

// Define policies for sessions
const policies: Policy[] = [
  {
    selector: {
      target: "0xYourContractAddress",
      function: "incrementCounter",
    },
    description: "Allows incrementing the counter",
  },
];

// Create the connector with configuration options
const connector = new ControllerConnector({
  rpc: "https://your-custom-rpc-url",
  policies: policies,
  starterPackId: "your-starter-pack-id",
  theme: "default",
  colorMode: "dark",
  propagateSessionErrors: true,
});
```

#### Customizing the Wallet Interface

You can customize the appearance of the wallet interface by specifying `theme` and `colorMode`.

Example:

```typescript
const connector = new ControllerConnector({
  theme: "my-custom-theme",
  colorMode: "light",
});
```

### Integrating with `StarknetProvider`

Wrap your application with the `StarknetProvider` and pass the connector:

```typescript
import { StarknetProvider } from "@starknet-react/core";

function App() {
  return (
    <StarknetProvider autoConnect connectors={[connector]}>
      {/* Your components */}
    </StarknetProvider>
  );
}
```

### Connecting a Wallet

Use the `useConnect` and `useAccount` hooks to manage wallet connections:

```typescript
import { useConnect, useAccount } from "@starknet-react/core";

function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const controllerConnector = connectors[0];

  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect({ connector: controllerConnector })}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

### Performing Transactions

Execute transactions using the `account` object:

```typescript
import { useAccount } from "@starknet-react/core";

function IncrementCounter() {
  const { account } = useAccount();

  const onIncrement = async () => {
    await account.execute([
      {
        contractAddress: "0xYourContractAddress",
        entrypoint: "incrementCounter",
        calldata: ["0x1"],
      },
    ]);
  };

  return <button onClick={onIncrement}>Increment Counter</button>;
}
```

### Accessing Account Details

Retrieve the connected account's address and username:

```typescript
import { useAccount } from "@starknet-react/core";

function AccountInfo() {
  const { account, address } = useAccount();

  // Assuming the account object has a method to get the username
  const username = account ? account.username : null;

  return (
    <div>
      <p>Account Address: {address}</p>
      {username && <p>Username: {username}</p>}
    </div>
  );
}
```
