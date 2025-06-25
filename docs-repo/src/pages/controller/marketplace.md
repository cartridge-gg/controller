---
description: Learn how to use the Cartridge Controller's marketplace features for listing, purchasing, and trading NFTs.
title: NFT Marketplace
---

# NFT Marketplace

Cartridge Controller provides built-in marketplace functionality that allows users to list, purchase, and trade NFTs directly from their inventory. The marketplace supports both single asset and bulk operations with transparent fee structures.

## Overview

The marketplace system is integrated into the Controller's inventory interface and provides:

- **List NFTs for sale** with customizable pricing and expiration
- **Purchase NFTs** from other users with fee transparency
- **Manage active listings** with easy unlisting
- **Bulk operations** for listing or purchasing multiple assets
- **Fee breakdown** showing marketplace fees and creator royalties
- **Multi-token support** for pricing in different ERC-20 tokens

## Listing NFTs

### Single Asset Listing

To list an NFT from your inventory:

1. Open your inventory: `controller.openProfile("inventory")`
2. Navigate to the NFT you want to list
3. Click the **"List"** button
4. Configure your listing:
   - **Price**: Set the price in your preferred token
   - **Currency**: Choose from available ERC-20 tokens
   - **Expiration**: Set when the listing expires (1w, 1mo, 3mo, or Never)
5. Review the listing details
6. Confirm the transaction

```typescript
// Programmatically open inventory to the marketplace
controller.openProfile("inventory");
```

### Bulk Listing

You can list multiple NFTs from the same collection at once:

1. In the collection view, select multiple NFTs
2. Click **"List Selected"**
3. Set a price per item and expiration
4. Review all listings in the confirmation screen
5. Confirm the batch transaction

### Listing Configuration

**Price Settings:**
- Set individual prices per NFT
- Choose from available ERC-20 tokens (ETH, STRK, USDC, etc.)
- Real-time USD conversion display

**Expiration Options:**
- **1 week**: Listing expires in 7 days
- **1 month**: Listing expires in 30 days  
- **3 months**: Listing expires in 90 days
- **Never**: Listing remains active indefinitely

## Purchasing NFTs

### Single Asset Purchase

To purchase an NFT:

1. Browse to the NFT you want to purchase
2. Click the **"Purchase"** button
3. Review the purchase details:
   - Asset information
   - Price breakdown
   - Marketplace fees
   - Creator royalties
4. Confirm the transaction

### Bulk Purchase

Purchase multiple NFTs in a single transaction:

1. Select multiple NFTs from the same collection
2. Click **"Purchase Selected"** 
3. Review the bulk purchase summary
4. Confirm the batch transaction

### Fee Structure

All purchases include transparent fee breakdowns:

**Marketplace Fee:**
- Percentage-based fee charged by the marketplace
- Displayed in both token amount and percentage

**Creator Royalties:**
- Royalties paid to the original NFT creator
- Percentage set by the collection creator
- Supports ERC-2981 royalty standard

**Example Fee Display:**
```
Cost: 0.98 STRK
Fees: 0.02 STRK
├─ Marketplace Fee: 0.01 STRK (1.0%)
└─ Creator Royalties: 0.01 STRK (1.0%)
Total: 1.00 STRK
```

## Managing Listings

### View Active Listings

Your active listings are displayed with status indicators:
- **Listed**: Currently available for purchase
- **Sold**: Successfully purchased by another user
- **Expired**: Listing has passed expiration date
- **Cancelled**: Manually unlisted by owner

### Unlisting NFTs

To remove an NFT from sale:

1. Navigate to your listed NFT
2. Click the **"Unlist"** button  
3. Confirm the transaction

The NFT will be immediately removed from the marketplace and returned to your inventory.

### Listing Status

Listings show relevant information:
- Current price and currency
- Time remaining until expiration
- Number of interested buyers (if applicable)

## Integration

### Opening Marketplace

The marketplace is accessed through the inventory modal:

```typescript
// Open inventory (marketplace is integrated)
controller.openProfile("inventory");

// Open directly to a specific collection
controller.openProfile("inventory", {
  contractAddress: "0x1234...",
});
```

### MarketplaceProvider

For custom integrations, use the marketplace provider:

```typescript
import { useMarketplace } from "@cartridge/marketplace";

function MyComponent() {
  const {
    orders,           // All marketplace orders
    collectionOrders, // Orders for current collection
    isListed,         // Whether current NFT is listed
    marketplaceFee,   // Current marketplace fee
    removeOrder,      // Function to remove listing
  } = useMarketplace();

  // Custom marketplace logic here
}
```

### Marketplace Hooks

**useMarketplace()**
- `orders`: All active marketplace orders
- `collectionOrders`: Orders filtered by collection
- `tokenOrders`: Orders for specific token
- `selfOrders`: Your own orders
- `isListed`: Boolean if asset is listed
- `marketplaceFee`: Current marketplace fee amount
- `royaltyFee`: Creator royalty amount
- `removeOrder()`: Remove a listing
- `addOrder()`: Add a new listing

## Configuration

### Marketplace Setup

The marketplace requires proper configuration in your Controller setup:

```typescript
const controller = new Controller({
  slot: "<your-project>", // Required for marketplace data
  // ... other options
});
```

### Token Configuration

Ensure marketplace-supported tokens are indexed in your Torii configuration:

```toml
# torii-config.toml
[indexing]
contracts = [
  "erc20:0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", # ETH
  "erc20:0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", # STRK
  # Add other supported payment tokens
]
```

## Best Practices

### For Sellers

**Pricing Strategy:**
- Research similar NFTs for competitive pricing
- Consider using stablecoins for price stability
- Set reasonable expiration times

**Listing Management:**
- Monitor your active listings regularly
- Update prices based on market conditions
- Use bulk operations for efficiency

### For Buyers

**Due Diligence:**
- Verify NFT authenticity and metadata
- Check creator royalty rates
- Review total cost including fees

**Transaction Safety:**
- Always review the complete fee breakdown
- Ensure sufficient token balance for purchase
- Be aware of network congestion affecting transaction times

### Security

**Smart Contract Interactions:**
- All marketplace transactions go through verified contracts
- Approval transactions are required before listing/purchasing
- Transactions are atomic (all-or-nothing)

**Asset Safety:**
- NFTs remain in your wallet until sold
- No custody risk during listing period
- Instant transfer upon successful purchase

## Troubleshooting

### Common Issues

**Listing Failed:**
- Ensure you own the NFT
- Check you have sufficient gas for approval transactions
- Verify the marketplace contract is properly configured

**Purchase Failed:**
- Confirm sufficient token balance (including fees)
- Check if listing has expired
- Ensure proper token approvals

**Transaction Pending:**
- Network congestion may delay confirmations
- Do not retry transactions to avoid duplicates
- Check transaction status on block explorer

### Error Messages

**"Insufficient balance"**: Need more tokens to complete purchase
**"Listing expired"**: Seller's listing has expired, cannot purchase
**"Not approved"**: Missing marketplace approval for tokens/NFTs
**"Invalid price"**: Price must be greater than zero

## API Reference

### Types

```typescript
interface OrderModel {
  id: number;
  collection: string;
  tokenId: string;
  owner: string;
  price: string;
  currency: string;
  expiration: number;
  status: StatusType;
}

interface MarketplaceOptions {
  book: boolean;
  order: boolean;
  sale: boolean;
  listing: boolean;
}
```

### Status Types

```typescript
enum StatusType {
  Placed = "PLACED",
  Executed = "EXECUTED", 
  Cancelled = "CANCELLED",
  Expired = "EXPIRED"
}
```

The marketplace functionality provides a seamless trading experience while maintaining the security and decentralization principles of the Cartridge ecosystem.