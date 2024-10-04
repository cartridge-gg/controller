# Getting Started

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

1.  [React](./examples/react.md): Learn how to integrate Cartridge Controller with the popular `starknet-react` library for React applications.

2.  [Svelte](./examples/svelte.md): Discover how to implement Cartridge Controller in Svelte applications, including setup and usage with Svelte's reactive paradigm.

3.  [Rust](./examples/rust.md): Explore how to use Cartridge Controller in a Rust environment, including setup and basic operations.

These examples provide step-by-step guidance on setting up the controller, configuring it, and performing common operations in different programming environments. They should help you get started quickly with integrating Cartridge Controller into your project.
