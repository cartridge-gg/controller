# Headless Mode Guide

## Overview

Headless mode enables programmatic authentication with the Cartridge Controller SDK without displaying any UI. You trigger headless mode by passing a `username` and `signer` to `connect(...)`.

```
Controller SDK → Keychain iframe (hidden) → Backend API
```

**Key Points**
- The keychain iframe still exists, but the modal is not opened.
- The SDK passes the connect request to keychain over Penpal.
- Keychain executes the same authentication logic as the UI flow.
- No duplicated auth logic in the SDK.

## Usage

### Basic (Passkey / WebAuthn)

```ts
import Controller from "@cartridge/controller";

const controller = new Controller({
  defaultChainId: "SN_SEPOLIA",
});

await controller.connect({
  username: "alice",
  signer: "webauthn",
});
```

### Password

```ts
await controller.connect({
  username: "alice",
  signer: "password",
  password: "correct horse battery staple",
});
```

### OAuth / EVM / WalletConnect

```ts
// Google / Discord
await controller.connect({ username: "alice", signer: "google" });
await controller.connect({ username: "alice", signer: "discord" });

// EVM wallets
await controller.connect({ username: "alice", signer: "metamask" });
await controller.connect({ username: "alice", signer: "rabby" });
await controller.connect({ username: "alice", signer: "phantom-evm" });

// WalletConnect
await controller.connect({ username: "alice", signer: "walletconnect" });
```

## Supported Auth Options

Headless mode supports all **implemented** auth options:
- `webauthn`
- `password`
- `google`
- `discord`
- `walletconnect`
- `metamask`
- `rabby`
- `phantom-evm`

## Handling Session Approval

If policies are unverified or include approvals, Keychain will prompt for
session approval **after** authentication. In that case, `connect` will open
the approval UI and resolve once the session is approved.

```ts
const account = await controller.connect({
  username: "alice",
  signer: "webauthn",
});

console.log("Session approved:", account.address);
```

If you want to react to approval completion (for example, to sync UI state),
you can also subscribe to the event:

```ts
const unsubscribe = controller.onHeadlessApprovalComplete((account) => {
  console.log("Session approved:", account.address);
  unsubscribe();
});
```

## Error Handling

The SDK provides specific error classes for headless mode:

```ts
import {
  HeadlessAuthenticationError,
} from "@cartridge/controller";

try {
  await controller.connect({ username: "alice", signer: "webauthn" });
} catch (error) {
  if (error instanceof HeadlessAuthenticationError) {
    // Auth failed (invalid credentials, signer mismatch, etc.)
  }
}
```

## Notes

- Headless mode uses the **existing signers** on the controller for the given username.
- For passkeys, the account must already have a WebAuthn signer registered.
- If policies are unverified or include approvals, Keychain will request
  explicit approval after authentication.
