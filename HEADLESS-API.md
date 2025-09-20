# Headless Authentication API

This document describes the new headless authentication API that allows applications to handle user signup and login programmatically without displaying the Cartridge modal.

## Overview

The headless API extends the existing `connect()` method to support programmatic authentication by inferring headless mode when both `username` and `authMethod` are provided.

## API Usage

### Basic Usage

```typescript
import { ControllerProvider } from "@cartridge/controller";

const controller = new ControllerProvider({
  chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" }],
});

// Headless authentication (auto-detects signup vs login)
const account = await controller.connect({
  username: "alice",
  authMethod: "metamask"
});

// Traditional modal-based authentication (unchanged)
const account = await controller.connect();
```

### Supported Authentication Methods

The headless API currently supports the following authentication methods:

- `"metamask"` - MetaMask wallet connection
- `"rabby"` - Rabby wallet connection  
- `"webauthn"` - WebAuthn/Passkey authentication
- `"walletconnect"` - WalletConnect protocol

**Note**: Social authentication methods (`"google"`, `"discord"`) are not supported in headless mode as they require user interaction with OAuth flows.

### Signup vs Login Detection

The system automatically determines whether to perform a signup or login flow:

1. **Username Exists**: If a controller is found for the provided username, it triggers a login flow
2. **Username Not Found**: If no controller exists for the username, it triggers a signup flow

No explicit signup/login parameter is needed - the system handles this automatically.

### Error Handling

```typescript
try {
  const account = await controller.connect({
    username: "alice",
    authMethod: "metamask"
  });
  console.log("Authentication successful:", account.address);
} catch (error) {
  console.error("Authentication failed:", error.message);
}
```

Common error scenarios:
- Invalid username format
- Unsupported authentication method
- Network connectivity issues
- User rejection of authentication request

## Implementation Status

### ✅ Completed
- Core API structure and type definitions
- Controller SDK modifications
- Keychain communication updates
- Basic error handling and validation
- Build and linting integration

### 🚧 In Progress
- WebAuthn headless implementation
- External wallet integration
- Comprehensive testing

### 📋 Planned
- Full authentication method implementations
- Enhanced error messages and handling
- Integration tests with various wallet types
- Documentation updates

## Technical Details

### Controller Changes

The `connect()` method signature has been updated:

```typescript
async connect(options?: ConnectOptions): Promise<WalletAccount | undefined>

interface ConnectOptions {
  username?: string;
  authMethod?: AuthOption;
}
```

When both `username` and `authMethod` are provided, headless mode is automatically activated.

### Keychain Integration

The keychain has been updated to handle headless authentication requests without displaying the modal UI. The connection context includes headless parameters that trigger programmatic authentication flows.

### Backward Compatibility

The changes are fully backward compatible. Existing applications using `controller.connect()` without parameters will continue to work exactly as before, displaying the modal interface.

## Migration Guide

### From Modal to Headless

```typescript
// Before (modal-based)
const account = await controller.connect();

// After (headless)
const account = await controller.connect({
  username: "user123",
  authMethod: "metamask"
});
```

### Error Handling Updates

Consider updating error handling to account for the programmatic nature of headless authentication:

```typescript
try {
  const account = await controller.connect({
    username: "alice",
    authMethod: "metamask"
  });
} catch (error) {
  // Handle authentication failures without user interaction
  if (error.message.includes("User rejected")) {
    // Handle rejection
  } else if (error.message.includes("not supported")) {
    // Fallback to modal or different auth method
  }
}
```

## Security Considerations

- The headless API maintains the same security model as the modal-based flow
- All cryptographic operations and key management remain unchanged
- Session tokens and policies work identically in both modes
- User consent is still required for wallet connections and transaction signing

## Future Enhancements

- Support for batch authentication of multiple users
- Enhanced authentication method detection and fallbacks  
- Integration with external authentication providers
- Improved error messages and debugging information