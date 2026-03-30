![Controller Cover Image](.github/cover.png)

# Controller

Controller is a gaming specific smart contract wallet that enables seamless
player onboarding and game interactions.

It supports transaction signing using Passkeys and Session Tokens.

## Project structure

The project consists of several packages in the `packages` directory:

- **[keychain](packages/keychain)** - Sandboxed iframe hosted at
  https://x.cartridge.gg/ that fills the same role as an injected wallet like
  MetaMask or Rabby: holds keys, signs transactions, and prompts user for approval.
  Also displays account state (balances, activities, achievements).
- **[controller](packages/controller)** - Main SDK implementing the account
  interfaces required by [starknet.js](https://github.com/0xs34n/starknet.js).
  Ships two provider modes:
  - **ControllerProvider** (web apps) - Full-featured web wallet communicating with an
    embedded keychain iframe. Supports sessions as well as per-transaction approval.
  - **SessionProvider** (native apps) - Creates ephemeral session keys with pre-configured
    policies so transactions can execute without per-call approval.
- **[connector](packages/connector)** - Thin adapter that wraps providers
  as [starknet-react](https://github.com/apibara/starknet-react) connectors,
  making them drop-in compatible with `<StarknetConfig>`.

Integration examples live in `examples/` (Next.js, Svelte, Node.js).

## Development

### Frontend

Install pnpm via corepack:

```sh
corepack enable pnpm
```

Install dependencies:

```sh
pnpm i
```

Run Controller with examples:

```sh
pnpm dev
```

This command builds all workspace dependencies first and start these servers:

- http://localhost:3002: Controller Example (Next.js)
- http://localhost:5174: Controller Example (Svelte)
- http://localhost:3001: Keychain
- http://localhost:3003: Profile

The simplest way to then develop with your cartridge account is to port it over
from the production keychain:

- Login to your account at https://x.cartridge.gg/login
- Open your console, dump your account with `window.cartridge.exportAccount()`
  and copy it
- Visting your local keychain at http://localhost:3001/
- Load your account into your local keychain

```js
window.cartridge.importAccount("EXPORTED ACCOUNT");
```
