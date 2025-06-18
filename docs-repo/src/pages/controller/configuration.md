---
description: Explore the configuration options available for Cartridge Controller, including chain settings, session management, and theme customization.
title: Controller Configuration
---

# Configuration

Controller provides several configuration options related to chains, sessions, and theming.

## ControllerOptions

```typescript
export type Chain = {
  rpcUrl: string;
};

export type ControllerOptions = {
    // Chain configuration
    chains?: Chain[];  // Custom RPC endpoints (takes precedence over default chains)
    chainId?: string;  // hex encoded
    
    // Session options 
    policies?: SessionPolicies;  // Session policies for pre-approved transactions
    propagateSessionErrors?: boolean;  // Propagate transaction errors back to caller
    
    // Customization options
    preset?: string;  // Preset name for custom themes and verified policies
    slot?: string;  // Slot project name for custom indexing
};
```

## Chain Configuration

Controller provides default Cartridge RPC endpoints for Starknet mainnet and sepolia networks:
- `https://api.cartridge.gg/x/starknet/mainnet`
- `https://api.cartridge.gg/x/starknet/sepolia`

When you provide custom chains via the `chains` option, they take precedence over the default Cartridge chains if they specify the same network. This allows you to:
- Use custom RPC endpoints for mainnet or sepolia
- Add support for additional networks (like Slot katana instances)
- Override default chain configurations

**Example:**
```typescript
const controller = new Controller({
  chains: [
    { rpcUrl: "https://api.cartridge.gg/x/my-game/sepolia" }, // Overrides default sepolia
    { rpcUrl: "http://localhost:5050" }, // Adds local development chain
  ],
  chainId: constants.StarknetChainId.SN_SEPOLIA,
});
```

## Configuration Categories

The configuration options are organized into several categories:

-   **Chain Options**: Core network configuration and chain settings
-   [**Session Options**](/controller/sessions.md): Session policies and transaction-related settings
-   **Customization Options**: [Presets](/controller/presets.md) for themes and verified policies, [Slot](/controller/inventory.md) for custom indexing
