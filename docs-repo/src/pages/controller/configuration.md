---
description: Explore the configuration options available for Cartridge Controller, including chain settings, session management, and theme customization.
title: Controller Configuration
---

# Configuration

Controller provides several configuration options related to chains, sessions, and theming.

## ControllerOptions

```typescript
export type ControllerOptions = {
    // Provider options (optional - defaults provided)
    chains?: [
        { rpcUrl: "https://your-custom-rpc.com" },
        // Default Cartridge chains are automatically added:
        // { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" },
        // { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet" },
    ],
    defaultChainId?: constants.StarknetChainId.SN_MAIN, // defaults to mainnet

    // Session options 
    policies?: SessionPolicies;  // Session policies
    propagateSessionErrors?: boolean;  // Propagate transaction errors back to caller

    // Preset options
    preset?: string;  // The preset name
    shouldOverridePresetPolicies?: boolean;  // Override preset policies with manual policies
};
```

## Simplified Initialization

The controller can now be initialized with minimal configuration. Default chains are automatically provided:

```typescript
// Minimal initialization - uses default chains and mainnet
const controller = new Controller({});

// With custom configuration
const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    policies: myPolicies,
    preset: "myPreset"
});
```

## Default Chains

By default, Controller automatically includes these Cartridge chains:
- **Mainnet**: `https://api.cartridge.gg/x/starknet/mainnet`
- **Sepolia**: `https://api.cartridge.gg/x/starknet/sepolia`

These are merged with any custom chains you provide, with your custom chains taking precedence for the same networks.

## RPC Provider Requirements

**Important**: For security and compatibility reasons:
- **Mainnet** and **Sepolia** networks must use Cartridge RPC providers
- Custom chains can use any RPC provider
- Invalid RPC configurations will throw an error during initialization

The configuration options are organized into several categories:

-   **Provider Options**: Core RPC configuration (now optional with defaults)
-   [**Session Options**](/controller/sessions.md): Session and transaction related settings
-   [**Preset Options**](/controller/presets.md): Configure a custom theme and verified session policies using Presets
