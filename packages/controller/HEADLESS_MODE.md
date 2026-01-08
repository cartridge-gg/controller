# Headless Mode Guide

## Overview

Headless mode enables programmatic authentication with the Cartridge Controller SDK without displaying any UI. This is ideal for server-side applications, automated scripts, or backend services that need to authenticate users programmatically.

## Architecture

The headless mode follows this architecture:

```
Controller SDK → Keychain iframe (no UI) → Backend API
```

**Key Points:**
- The keychain iframe still exists but is not displayed
- The SDK passes credentials to the keychain via Penpal communication
- The keychain handles ALL authentication logic (password encryption, GraphQL calls, session management)
- No code duplication - auth logic remains centralized in the keychain
- The modal is simply not opened in headless mode

This architecture maintains security and keeps authentication logic centralized while enabling programmatic access.

## Supported Authentication Methods

Headless mode supports all authentication methods:

1. **Password** - Traditional username/password authentication
2. **WebAuthn** - Passkey-based authentication
3. **Google** - OAuth via Google (EIP-191 signature)
4. **Discord** - OAuth via Discord (EIP-191 signature)
5. **MetaMask** - Ethereum wallet authentication (EIP-191 signature)
6. **Rabby** - Ethereum wallet authentication (EIP-191 signature)
7. **Phantom EVM** - Ethereum wallet authentication (EIP-191 signature)
8. **Argent** - StarkNet wallet authentication
9. **Braavos** - StarkNet wallet authentication
10. **SIWS** - Sign-in with StarkNet

## Usage

### Basic Setup

To use headless mode, pass the `headless` option when creating your controller:

```typescript
import Controller from "@cartridge/controller";

const controller = new Controller({
  headless: {
    username: "myusername",
    credentials: {
      type: "password",
      password: "mypassword"
    }
  }
});

// Connect without showing UI
await controller.connect();
```

### Authentication Method Examples

#### 1. Password Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "alice",
    credentials: {
      type: "password",
      password: "securePassword123!"
    }
  }
});

await controller.connect();
```

#### 2. WebAuthn / Passkey Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "bob",
    credentials: {
      type: "webauthn",
      credentialId: "credential-id-from-registration",
      publicKey: "public-key-from-registration"
    }
  }
});

await controller.connect();
```

#### 3. Google OAuth Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "charlie",
    credentials: {
      type: "google",
      address: "0x1234..." // EIP-191 signed address
    }
  }
});

await controller.connect();
```

#### 4. Discord OAuth Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "dave",
    credentials: {
      type: "discord",
      address: "0x5678..." // EIP-191 signed address
    }
  }
});

await controller.connect();
```

#### 5. MetaMask Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "eve",
    credentials: {
      type: "metamask",
      address: "0x9abc..." // EIP-191 signed address
    }
  }
});

await controller.connect();
```

#### 6. Rabby Wallet Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "frank",
    credentials: {
      type: "rabby",
      address: "0xdef0..." // EIP-191 signed address
    }
  }
});

await controller.connect();
```

#### 7. Phantom EVM Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "grace",
    credentials: {
      type: "phantom-evm",
      address: "0x1111..." // EIP-191 signed address
    }
  }
});

await controller.connect();
```

#### 8. Argent Wallet Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "hank",
    credentials: {
      type: "argent",
      address: "0x2222..." // StarkNet address
    }
  }
});

await controller.connect();
```

#### 9. Braavos Wallet Authentication

```typescript
const controller = new Controller({
  headless: {
    username: "iris",
    credentials: {
      type: "braavos",
      address: "0x3333..." // StarkNet address
    }
  }
});

await controller.connect();
```

#### 10. SIWS (Sign-In With StarkNet)

```typescript
const controller = new Controller({
  headless: {
    username: "jack",
    credentials: {
      type: "siws",
      address: "0x4444...",
      signature: "signature-from-starknet-wallet"
    }
  }
});

await controller.connect();
```

## Complete Example: Server-Side Usage

```typescript
import Controller from "@cartridge/controller";
import { constants } from "starknet";

async function authenticateUser(username: string, password: string) {
  // Create controller with headless mode
  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username,
      credentials: {
        type: "password",
        password
      }
    }
  });

  try {
    // Connect without UI
    const account = await controller.connect();

    if (!account) {
      throw new Error("Authentication failed");
    }

    console.log("Authenticated successfully!");
    console.log("Account address:", account.address);

    // Now you can use the account for transactions
    // const result = await account.execute([...calls]);

    return account;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

// Usage
authenticateUser("myuser", "mypassword")
  .then(account => {
    console.log("Ready to use account:", account.address);
  })
  .catch(error => {
    console.error("Failed to authenticate:", error);
  });
```

## Security Best Practices

1. **Never hardcode credentials** in your source code
2. **Use environment variables** for sensitive data:
   ```typescript
   const controller = new Controller({
     headless: {
       username: process.env.CARTRIDGE_USERNAME!,
       credentials: {
         type: "password",
         password: process.env.CARTRIDGE_PASSWORD!
       }
     }
   });
   ```

3. **Use secure credential storage** (e.g., secret managers, encrypted vaults)
4. **Rotate credentials regularly** for production systems
5. **Prefer WebAuthn/passkeys** over passwords when possible
6. **Use OAuth methods** (Google, Discord) for user-facing applications
7. **Implement rate limiting** to prevent brute force attacks
8. **Log authentication attempts** for security monitoring
9. **Use HTTPS** for all API communications
10. **Validate and sanitize** all user inputs

## Error Handling

The SDK provides specific error classes for headless mode:

```typescript
import {
  HeadlessAuthenticationError,
  InvalidCredentialsError,
  HeadlessModeNotSupportedError
} from "@cartridge/controller";

try {
  await controller.connect();
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error("Invalid credentials:", error.message);
  } else if (error instanceof HeadlessAuthenticationError) {
    console.error("Authentication error:", error.message);
  } else if (error instanceof HeadlessModeNotSupportedError) {
    console.error("Operation not supported:", error.message);
  }
}
```

## Type Safety

The headless credentials use TypeScript discriminated unions for type safety:

```typescript
import { HeadlessCredentialData } from "@cartridge/controller";

// TypeScript will ensure you provide the correct fields for each type
const passwordCreds: HeadlessCredentialData = {
  type: "password",
  password: "secret" // ✓ Required for password type
};

const webauthnCreds: HeadlessCredentialData = {
  type: "webauthn",
  credentialId: "id",
  publicKey: "key" // ✓ Required for webauthn type
};

// TypeScript will error if you provide wrong fields
const invalidCreds: HeadlessCredentialData = {
  type: "password",
  address: "0x..." // ✗ Error: address not valid for password type
};
```

## Limitations

1. **UI operations are not available** in headless mode
   - `openSettings()`, `openProfile()`, `openPurchaseCredits()` will not work
   - Use error handling to detect when UI operations are called

2. **Session creation** still requires keychain initialization
   - The iframe is created but not displayed
   - First connection may take slightly longer

3. **Keychain implementation required**
   - This guide covers the Controller SDK side only
   - The keychain package must implement headless authentication handling
   - See `IMPLEMENTATION_SUMMARY.md` for technical details

## Next Steps

1. **Obtain credentials** for your authentication method
2. **Set up environment variables** for credential storage
3. **Implement error handling** for authentication failures
4. **Test in development** before deploying to production
5. **Monitor authentication logs** for security

## Support

For issues or questions:
- GitHub: https://github.com/cartridge-gg/controller
- Documentation: https://docs.cartridge.gg
- Discord: https://discord.gg/cartridge

## Related Documentation

- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `examples/headless-simple.ts` - Simple usage examples
- Controller SDK API documentation
