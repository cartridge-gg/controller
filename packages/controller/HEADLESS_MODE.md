# Headless Mode for Controller SDK

## Overview

Headless mode enables programmatic authentication with the Controller SDK without displaying any UI. The SDK passes credentials to the keychain iframe, which handles all authentication logic without rendering UI components.

## Architecture

```
Controller SDK
  ↓ (pass username + credentials via Penpal)
Keychain iframe (no UI displayed)
  ↓ (handles all auth: password encryption, GraphQL calls, etc.)
Backend API
  ↓
Returns ConnectReply
```

**Key Points:**
- ✅ Keychain iframe still exists (not removed)
- ✅ Keychain handles ALL auth logic (no duplication in SDK)
- ✅ Modal simply not displayed in headless mode
- ✅ Same authentication flow as UI mode, just invisible

## Quick Start

### Installation

```bash
npm install @cartridge/controller
# or
pnpm add @cartridge/controller
```

### Basic Usage

```typescript
import ControllerProvider from "@cartridge/controller";

const controller = new ControllerProvider({
  chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" }],
  headless: {
    username: "alice",
    credentials: {
      type: "password",
      password: process.env.CONTROLLER_PASSWORD!,
    },
  },
});

const account = await controller.connect();
// No UI shown! Account is ready to use.
```

## Supported Authentication Methods

### 1. Password

```typescript
headless: {
  username: "alice",
  credentials: {
    type: "password",
    password: "your-secure-password",
  },
}
```

**Security Note:** Store passwords in environment variables or secure vaults, never in code.

### 2. WebAuthn (Hardware Keys / Passkeys)

```typescript
headless: {
  username: "bob",
  credentials: {
    type: "webauthn",
    credentialId: "stored-credential-id",
    publicKey: "stored-public-key",
  },
}
```

**Note:** Credentials must be pre-registered.

### 3. Google OAuth

```typescript
headless: {
  username: "charlie",
  credentials: {
    type: "google",
    address: "0x1234...", // Ethereum address from Google OAuth
  },
}
```

### 4. Discord OAuth

```typescript
headless: {
  username: "dave",
  credentials: {
    type: "discord",
    address: "0x5678...",
  },
}
```

### 5. MetaMask / EVM Wallets

```typescript
headless: {
  username: "eve",
  credentials: {
    type: "metamask", // or "rabby", "phantom-evm"
    address: "0xabcd...",
  },
}
```

### 6. Starknet Wallets (Argent / Braavos)

```typescript
headless: {
  username: "frank",
  credentials: {
    type: "argent", // or "braavos"
    address: "0x0123...",
  },
}
```

### 7. Sign-In with Starknet (SIWS)

```typescript
headless: {
  username: "grace",
  credentials: {
    type: "siws",
    address: "0x4567...",
    signature: "0x...",
  },
}
```

## How It Works

### Controller SDK Changes (Minimal)

The controller SDK makes minimal changes:
1. Accept `headless` option in constructor
2. Don't open iframe modal if headless mode
3. Pass `username` and `credentials` to keychain
4. Don't close modal in finally block if headless

That's it! ~15 lines changed.

### Keychain Changes (Where Logic Lives)

The keychain package needs to:
1. Update `connect()` to accept `username` and `credentials` parameters
2. Detect headless mode (both params provided)
3. Run existing auth logic without showing UI components
4. Return `ConnectReply` as normal

All authentication logic stays in the keychain - no duplication!

## API Reference

### HeadlessOptions

```typescript
interface HeadlessOptions {
  username: string;
  credentials: HeadlessCredentialData;
}
```

### HeadlessCredentialData

Discriminated union of all credential types:

```typescript
type HeadlessCredentialData =
  | { type: 'password'; password: string }
  | { type: 'webauthn'; credentialId: string; publicKey: string }
  | { type: 'google' | 'discord' | 'metamask' | 'rabby' | 'phantom-evm'; address: string }
  | { type: 'argent' | 'braavos'; address: string }
  | { type: 'siws'; address: string; signature: string };
```

### ControllerOptions (Extended)

```typescript
interface ControllerOptions {
  // ... existing fields ...
  headless?: HeadlessOptions; // New field
}
```

### Keychain Interface (Updated)

```typescript
interface Keychain {
  connect(
    signupOptions?: AuthOptions,
    username?: string,
    credentials?: HeadlessCredentialData,
  ): Promise<ConnectReply | ConnectError>;
  // ... rest unchanged
}
```

## Error Handling

```typescript
import { HeadlessAuthenticationError } from "@cartridge/controller";

try {
  await controller.connect();
} catch (error) {
  if (error instanceof HeadlessAuthenticationError) {
    console.error("Authentication failed:", error.message);
  }
}
```

## Behavior

### Auto Login/Signup

Same smart behavior as UI mode:
1. **Existing User**: If username exists → logs in
2. **New User**: If username doesn't exist → creates account
3. **Existing User, Wrong Credentials**: Error

### Session Management

Sessions auto-created if policies are whitelisted (same as UI mode).

## Implementation Status

### ✅ Controller SDK - COMPLETE

- [x] Type definitions added
- [x] `connect()` method updated (don't open modal)
- [x] Pass username + credentials to keychain
- [x] Backwards compatible

### 🔄 Keychain Package - TODO

- [ ] Update `connect()` signature to accept username + credentials
- [ ] Detect headless mode (username + credentials present)
- [ ] Run auth logic without rendering UI
- [ ] Test all authentication methods in headless mode

## Security Best Practices

### 1. Credential Storage

**❌ Don't:**
```typescript
const password = "my-password"; // BAD!
```

**✅ Do:**
```typescript
const password = process.env.CONTROLLER_PASSWORD!;
```

### 2. Password Encryption

The keychain handles all password encryption:
- PBKDF2 (100,000 iterations) for key derivation
- AES-GCM (256-bit) for encryption
- Random salt & IV for each encryption

Backend never sees plaintext passwords!

### 3. HTTPS Required

Always use HTTPS in production.

## Performance Benefits

| Metric | UI Mode | Headless Mode | Improvement |
|--------|---------|---------------|-------------|
| User Interaction | Required | None | **Instant** |
| Modal Rendering | ~500ms | 0ms | **Faster** |
| Bundle Impact | Full UI | Minimal | **Smaller** |

## Migration Guide

### From UI Mode

**Before:**
```typescript
const controller = new ControllerProvider({
  chains: [{ rpcUrl: "..." }],
  signupOptions: ["password", "google"],
});

await controller.connect(); // Opens UI
```

**After:**
```typescript
const controller = new ControllerProvider({
  chains: [{ rpcUrl: "..." }],
  headless: {
    username: "alice",
    credentials: { type: "password", password: process.env.PASSWORD! },
  },
});

await controller.connect(); // No UI!
```

## Testing

Once the keychain implements headless support, test:

- [ ] Password authentication
- [ ] WebAuthn with pre-registered credentials
- [ ] All OAuth providers
- [ ] All wallet types
- [ ] Error scenarios
- [ ] Session creation

## Next Steps

1. **Implement keychain headless support** (main work)
2. Test all authentication methods
3. Update keychain documentation
4. Release!

## Questions?

- Controller SDK changes: See this file
- Keychain implementation: See keychain package docs
- Issues: https://github.com/cartridge-gg/controller/issues
