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

## Cross-Profile Features

The Controller supports viewing and interacting with other users' profiles and inventories, enabling features like purchasing assets from other players.

### View Other Profiles

You can navigate to another user's profile by using URL parameters:

```
https://your-app.com/account/username?address=0x1234567890abcdef...
```

The `address` parameter allows you to override the current profile view to display another user's inventory and assets.

### Cross-Profile Purchases

When viewing another user's profile, you can purchase their listed marketplace assets directly. The purchase flow includes:

1. **Browse Assets**: View assets listed for sale in another user's inventory
2. **Purchase Flow**: Execute purchase transactions for listed items
3. **Automatic Updates**: The UI automatically refreshes after successful purchases to reflect changes

This functionality enables peer-to-peer trading and marketplace interactions between players in games using the Controller.

### Profile Navigation

The profile system supports flexible navigation patterns:

- **Direct Profile Access**: Navigate to specific profiles using account addresses
- **Marketplace Integration**: Purchase assets across different user profiles
- **Seamless UX**: Profile switching maintains session state and preferences
