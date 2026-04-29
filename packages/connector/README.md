# @cartridge/connector

Cartridge Controller connector for `starknet-react` and other StarkNet wallet libraries.

## Why this package needs to be instantiated

The Cartridge Controller is iframe-based and requires per-app configuration (chains, paymaster, preset, etc.).
Unlike browser-extension wallets, it cannot auto-inject itself at page load — the dapp must construct it once at app startup.

When `ControllerConnector` is instantiated, it:

- Sets `window.starknet_controller` so legacy `window.starknet_*` discovery finds it.
- Calls `@wallet-standard/wallet`'s `registerWallet(...)` so any wallet-standard consumer (e.g. `starknet-start` via `@starknet-io/get-starknet-core`) discovers it through the standard event channel.

After that, discovery and disconnect work without further setup.

## Integration paths

### `starknet-react` v5

```ts
import ControllerConnector from "@cartridge/connector";
import { StarknetConfig, publicProvider } from "@starknet-react/core";

const connectors = [new ControllerConnector(options)];

<StarknetConfig connectors={connectors} provider={publicProvider()}>
  <App />
</StarknetConfig>;
```

### `starknet-start` (`@starknet-react/start`)

Instantiate `ControllerConnector` once at app startup with your config.
You don't need to pass it anywhere — the constructor side effect registers Cartridge with starknet-start's discovery.

```ts
import ControllerConnector from "@cartridge/connector";

new ControllerConnector(options);
```

For `recommendedWallets` lists, use `id: "controller"`.

### Vanilla `get-starknet` / wallet-standard

Same pattern — instantiating `ControllerConnector` registers the wallet via `@wallet-standard/wallet`.

`controller.asWalletStandard()` is also exposed on the underlying `ControllerProvider` for callers that want the `WalletWithStarknetFeatures` wrapper directly without going through discovery.
