# Cartridge Controller

Cartridge Controller is a web wallet for starknet that leverages webauthn for
transaction / session authorization.

It consists of the [`keychain`](packages/keychain) which is a simple, sandboxed
application hosted at https://x.cartridge.gg/ and responsible for sensitive
operations, such as signing transactions. When an application requests to sign
or execute a transaction, keychain enforces client side authorization logic and
displays UI for user approval if necessary.

Interaction with the `keychain` is done throught the
[`controller`](packages/controller) sdk. Controller implements the account
interfaces required by [starknet.js](https://github.com/0xs34n/starknet.js).
Underneath, the implementation communicates with an embedded sandboxed keychain
iframe.

## Development

Install pnpm via corepack:

```sh
corepack enable pnpm
```

Install dependencies:

```sh
pnpm i
```

Build dependencies:

```sh
pnpm build
```

Run `keychain` and `starknet-react-next`:

```sh
pnpm dev
```

Open <http://localhost:3002> in your browser.

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
