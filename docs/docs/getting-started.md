---
title: Getting Started
sidebar_position: 0
slug: /getting-started
---

Cartridge Controller is a gaming specific smart contract wallet plugin that enables seamless player onboarding and game interactions while maintaining compatibility with other wallets that implement the plugin account architecture (e.g. Argent).

Controller implements a standard account interface and can be integrated the same way as existing wallets.

```sh
pnpm add @cartridge/controller starknet
```

```ts
import Controller from "@cartridge/controller";

const controller = new Controller();
const account = controller.connect();

account.execute({ ... });
```

## Preapproving interactions

Catridge Controller supports requesting preapproval for a set of `policies`. When a policy is preapproved, games can perform the interaction seamlessly without requesting approval from the player each time. Policys are requested during connection. Executing transactions follows the same pattern and controller will take care of requesting player approval only when necessary.

```ts
// Using the controller directly.
const controller = new Controller([{
    target: "0xdead",
    method: "have_turn",
}]);

// Using starknet-react connector
const connector = new CartridgeConnector([{
    target: "0xdead",
    method: "have_turn",
}])
```
