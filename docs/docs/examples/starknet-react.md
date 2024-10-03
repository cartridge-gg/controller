---
title: Using starknet-react
sidebar_position: 1
---


```sh
yarn add @cartridge/connector @cartridge/controller @starknet-react/core starknet
```

```ts
import ControllerConnector from "@cartridge/connector";
const connector = new CartridgeConnector()

...
<StarknetProvider autoConnect connectors={[connector]}>
    ...
</StarknetProvider>
...
```

## Session creation

```ts
const connector = new CartridgeConnector([{
    target: "0xdead",
    method: "have_turn",
}])
```
