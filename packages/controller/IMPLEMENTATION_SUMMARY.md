# Headless Mode Implementation Summary

## Overview

This document describes the technical implementation of headless mode for the Controller SDK. The implementation is minimal, adding approximately ~15 lines of logic to the `connect()` method while keeping all authentication logic in the keychain package.

## Architecture Decision

The implementation follows the principle of **separation of concerns**:

```
┌─────────────────┐
│ Controller SDK  │  - Accepts headless options
│                 │  - Passes to keychain
│                 │  - Controls modal visibility
└────────┬────────┘
         │
         │ Penpal communication
         │
┌────────▼────────┐
│ Keychain iframe │  - Handles ALL auth logic
│                 │  - Password encryption
│                 │  - GraphQL API calls
│                 │  - Session management
└─────────────────┘
         │
         │ HTTP/GraphQL
         │
┌────────▼────────┐
│  Backend API    │  - Validates credentials
│                 │  - Returns session tokens
│                 │  - Manages user accounts
└─────────────────┘
```

**Key principle:** Controller SDK is a thin client that delegates to keychain. No code duplication.

## Changes Made

### 1. Type Definitions (src/types.ts)

Added comprehensive type definitions for headless mode:

```typescript
// Credential type discriminator
export type HeadlessCredentialType = 'webauthn' | 'password' | 'google' | 'discord' |
  'metamask' | 'rabby' | 'phantom-evm' | 'argent' | 'braavos' | 'siws';

// Discriminated union for type-safe credentials
export type HeadlessCredentialData =
  | HeadlessPasswordCredentials
  | HeadlessWebAuthnCredentials
  | HeadlessEIP191Credentials
  | HeadlessStarknetCredentials
  | HeadlessSIWSCredentials;

// Main headless options interface
export interface HeadlessOptions {
  username: string;
  credentials: HeadlessCredentialData;
}
```

**Benefits:**
- Type safety via discriminated unions
- Compile-time validation of credential structures
- IntelliSense support in IDEs
- Prevents runtime errors from invalid credential shapes

**Lines added:** ~45 lines (mostly interface definitions)

### 2. Controller Connect Method (src/controller.ts)

Modified the `connect()` method to support headless mode:

```typescript
async connect(signupOptions?: AuthOptions): Promise<WalletAccount | undefined> {
  const headlessOptions = this.options.headless; // +1 line

  // ... existing setup code ...

  // Only open modal if NOT headless
  if (!headlessOptions) {                        // +3 lines
    this.iframes.keychain.open();
  }

  try {
    const effectiveOptions = signupOptions ?? this.options.signupOptions;

    // Pass username and credentials to keychain
    let response = await this.keychain.connect(
      effectiveOptions,
      headlessOptions?.username,                 // +2 lines
      headlessOptions?.credentials,
    );

    // ... existing response handling ...

  } finally {
    // Only close modal if it was opened (not headless)
    if (!headlessOptions) {                      // +3 lines
      this.iframes.keychain.close();
    }
  }
}
```

**Changes:**
- Extract headless options (1 line)
- Conditional modal open (3 lines)
- Pass credentials to keychain (2 lines)
- Conditional modal close (3 lines)

**Total logic added:** ~9 lines (excluding comments)

**What didn't change:**
- No new authentication logic
- No password handling
- No API calls
- No encryption
- No session management

### 3. Keychain Interface (src/types.ts)

Updated the `Keychain` interface to accept headless parameters:

```typescript
export interface Keychain {
  connect(
    signupOptions?: AuthOptions,
    username?: string,              // +1 line
    credentials?: HeadlessCredentialData, // +1 line
  ): Promise<ConnectReply | ConnectError>;
  // ... rest unchanged
}
```

**Changes:** Added two optional parameters to existing method signature.

### 4. Error Classes (src/errors.ts)

Added three error classes for headless mode:

```typescript
export class HeadlessAuthenticationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = "HeadlessAuthenticationError";
    Object.setPrototypeOf(this, HeadlessAuthenticationError.prototype);
  }
}

export class InvalidCredentialsError extends HeadlessAuthenticationError {
  constructor(credentialType: string) {
    super(`Invalid credentials provided for type: ${credentialType}`);
    this.name = "InvalidCredentialsError";
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class HeadlessModeNotSupportedError extends Error {
  constructor(operation: string) {
    super(`Operation "${operation}" is not supported in headless mode`);
    this.name = "HeadlessModeNotSupportedError";
    Object.setPrototypeOf(this, HeadlessModeNotSupportedError.prototype);
  }
}
```

**Lines added:** ~30 lines (error class boilerplate)

### 5. KeychainOptions (src/types.ts)

Added headless option to controller configuration:

```typescript
export type KeychainOptions = IFrameOptions & {
  // ... existing fields ...
  headless?: HeadlessOptions; // +1 line
};
```

## Total Changes Summary

| File | Lines Added | Lines Modified | Purpose |
|------|-------------|----------------|---------|
| src/types.ts | ~50 | ~2 | Type definitions and interface updates |
| src/controller.ts | ~9 | ~3 | Conditional modal display logic |
| src/errors.ts | ~30 | 0 | Error classes for better error handling |
| **Total** | **~89** | **~5** | **Headless mode implementation** |

**Plus documentation:**
- HEADLESS_MODE.md (~250 lines) - User guide
- IMPLEMENTATION_SUMMARY.md (this file) - Technical reference
- examples/headless-simple.ts (~150 lines) - Usage examples

## What This Implementation Does

1. **Accepts headless configuration** via constructor options
2. **Skips modal display** when headless mode is enabled
3. **Passes credentials to keychain** via existing Penpal communication
4. **Maintains iframe** (not removed, just not displayed)
5. **Provides type safety** via discriminated unions
6. **Exports error classes** for better error handling

## What This Implementation Does NOT Do

1. ❌ Duplicate authentication logic
2. ❌ Handle password encryption
3. ❌ Make GraphQL API calls
4. ❌ Manage sessions directly
5. ❌ Bypass the keychain
6. ❌ Remove the iframe
7. ❌ Create a mock keychain

## Design Principles

### 1. Minimal Changes
- Only ~15 lines of logic added to `connect()` method
- No structural changes to existing code
- Backwards compatible (headless is optional)

### 2. Single Responsibility
- Controller SDK: UI and communication layer
- Keychain: Authentication and session logic
- Backend: Credential validation and storage

### 3. Type Safety
- Discriminated unions prevent invalid credential shapes
- TypeScript enforces correct credential fields per type
- IDE autocomplete guides developers

### 4. Separation of Concerns
- SDK doesn't know about password hashing algorithms
- SDK doesn't know about API endpoints
- SDK doesn't know about session token formats
- All of this stays in the keychain

### 5. Security
- Credentials are passed through secure Penpal communication
- No credential storage in controller SDK
- No logging of sensitive data
- Keychain handles all encryption

## Data Flow

```
1. Developer creates Controller with headless options
   ↓
2. Controller stores options but doesn't process them
   ↓
3. Developer calls controller.connect()
   ↓
4. Controller checks if headless mode is enabled
   ↓
5. If headless: Skip modal.open()
   ↓
6. Controller calls keychain.connect(options, username, credentials)
   ↓
7. Keychain receives credentials via Penpal
   ↓
8. Keychain handles authentication (existing logic)
   ↓
9. Keychain returns ConnectReply or ConnectError
   ↓
10. Controller creates ControllerAccount
   ↓
11. If headless: Skip modal.close()
   ↓
12. Return account to developer
```

## Next Steps: Keychain Implementation

This implementation covers only the **Controller SDK side**. The keychain package must implement:

1. **Update Penpal method signature** to accept username and credentials
2. **Handle headless authentication** in the keychain's connect method
3. **Implement credential validation** for each auth type
4. **Call appropriate backend APIs** for authentication
5. **Return session tokens** in the same format as UI flow

**Estimated keychain changes:**
- ~50-100 lines in keychain connect handler
- Credential routing logic (password vs webauthn vs OAuth)
- Backend API integration (already exists, just call programmatically)
- Error handling and validation

**Important:** The keychain should reuse existing authentication code. Do NOT duplicate logic.

## Testing Strategy

### Unit Tests
- Test type definitions are correct
- Test connect() method with and without headless
- Test modal open/close is conditional
- Test error classes instantiate correctly

### Integration Tests
- Test full authentication flow with headless mode
- Test each credential type (password, webauthn, etc.)
- Test error handling for invalid credentials
- Test backwards compatibility (non-headless still works)

### Security Tests
- Verify credentials are not logged
- Verify credentials are not stored in SDK
- Verify communication is encrypted (Penpal)
- Test rate limiting and brute force protection

## Backwards Compatibility

The implementation is fully backwards compatible:

```typescript
// Old code still works (no headless option)
const controller = new Controller({
  defaultChainId: constants.StarknetChainId.SN_MAIN
});
await controller.connect(); // Shows modal as before

// New code with headless
const controller = new Controller({
  defaultChainId: constants.StarknetChainId.SN_MAIN,
  headless: { username: "alice", credentials: { type: "password", password: "secret" } }
});
await controller.connect(); // No modal shown
```

## Performance Impact

- **Negligible overhead:** 1 if-statement check added to connect()
- **No additional network calls:** Same API calls as before
- **No additional imports:** All types are in existing files
- **Bundle size impact:** ~1-2KB (mostly type definitions, stripped in JS)

## Conclusion

This implementation successfully adds headless mode support to the Controller SDK with:

- ✅ Minimal code changes (~15 lines of logic)
- ✅ No code duplication (auth stays in keychain)
- ✅ Full type safety (discriminated unions)
- ✅ Backwards compatibility (optional feature)
- ✅ Clear architecture (SDK → Keychain → Backend)
- ✅ Comprehensive documentation (guides and examples)

The implementation adheres to SOLID principles and maintains the existing architecture while enabling powerful new use cases for server-side and programmatic authentication.
