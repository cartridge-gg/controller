![Controller Cover Image](.github/cover.png)

# Controller

Controller is a gaming specific smart contract wallet that enables seamless
player onboarding and game interactions.

It supports transaction signing using Passkeys and Session Tokens.

## Project structure

The project consists of several subfolders located in the `packages` directory:

- **[keychain](packages/keychain)** - a sandboxed application hosted at
  https://x.cartridge.gg/ and responsible for sensitive operations, such as
  signing transactions. When an application requests to sign or execute a
  transaction, keychain enforces client side authorization logic and displays UI
  for user approval if necessary and responsible for displaying the state of
  Controller account, such as token balances, activities, and achievement.
- **[controller](packages/controller)** sdk. Controller implements the account
  interfaces required by [starknet.js](https://github.com/0xs34n/starknet.js).
  Underneath, the implementation communicates with an embedded sandboxed
  keychain iframe.

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
