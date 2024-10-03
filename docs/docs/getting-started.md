---
title: Getting Started
sidebar_position: 0
---

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

## Examples

For more detailed examples of how to use Cartridge Controller in different environments, please check out our examples:

1.  [Using starknet-react](./examples/starknet-react.md): Learn how to integrate Cartridge Controller with the popular `starknet-react` library for React applications.

2.  [Using Rust](./examples/rust.md): Explore how to use Cartridge Controller in a Rust environment, including setup and basic operations.

These examples provide step-by-step guidance on setting up the controller, configuring it, and performing common operations in different programming environments. They should help you get started quickly with integrating Cartridge Controller into your project.
