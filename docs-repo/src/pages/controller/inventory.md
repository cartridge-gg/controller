---
description: Learn how to use and configure the Cartridge Controller's Inventory modal for managing ERC-20 and ERC-721 assets.
title: Controller Inventory Management
---

# Inventory 

Cartridge Controller provides Inventory modal to manage account assets (`ERC-20`, `ERC-721`).

## Configure tokens

By default, commonly used tokens are indexed and automatically shown. Full list of default tokens are listed in [`torii-config/public-tokens/mainnet.tom`](https://github.com/cartridge-gg/controller/blob/main/packages/torii-config/public-tokens/mainnet.toml). This list can be extended by configuring Torii hosted on Slot.

### Configure additional token to index

```toml
# torii-config.toml

[indexing]
contracts = [
  "erc20:<contract-address>",
  "erc721:<contract-address>"
]
```

### Create or update Torii instance on Slot

```sh
slot d create <project> torii --config <path/to/torii-config.toml>
```

### Configure Controller

Provide Slot project name to `ControllerOptions`.

```typescript
const controller = new Controller({
  slot: "<project>" 
});

// or via connector
const connector = new CartridgeConnector({
  slot: "<project>" 
})
```

### Open Inventory modal

```typescript
controller.openProfile("inventory");
```

## Marketplace Features

The Cartridge Controller inventory includes built-in marketplace functionality for trading NFTs:

### Available Actions

**For NFT Owners:**
- **List for sale**: Set price, currency, and expiration for your NFTs
- **Manage listings**: View, update, or cancel active listings  
- **Bulk operations**: List multiple NFTs simultaneously

**For Buyers:**
- **Purchase NFTs**: Buy listed NFTs with transparent fee breakdown
- **Multi-asset purchase**: Buy multiple NFTs in a single transaction
- **Fee transparency**: See marketplace fees and creator royalties upfront

### Supported Features

- **Multi-token pricing**: List/buy with ETH, STRK, USDC, and other ERC-20 tokens
- **Flexible expiration**: Set listing duration from 1 week to indefinite
- **Royalty support**: Automatic creator royalty payments via ERC-2981
- **Real-time updates**: Live marketplace data and order management

### Quick Start

1. Open your inventory with NFTs
2. Click **"List"** on any NFT you want to sell
3. Set your price and expiration preferences  
4. Confirm the listing transaction

For detailed marketplace documentation, see the [Marketplace guide](/controller/marketplace).
