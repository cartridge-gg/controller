# PR Summary: Refactor Starterpack Architecture - Claim vs Onchain Flow Separation

## Overview
This PR refactors the starterpack system to clearly separate two distinct acquisition flows:
1. **Claimed starterpacks** - Free starterpacks distributed via GraphQL/merkle drops (formerly called "backend")
2. **Onchain starterpacks** - Paid starterpacks purchased via smart contracts

The refactoring improves type safety, code clarity, and maintainability by using proper discriminated unions and removing legacy terminology.

## Key Changes

### 🏗️ Architecture Changes

#### 1. Terminology Migration: "Backend" → "Claim/Claimed"
- Renamed `StarterpackSource` type from `"backend" | "onchain"` to `"claimed" | "onchain"`
- Updated all variable names, function names, and comments throughout the codebase
- Changed type discriminator from `source` to `type` for consistency with discriminated union patterns

#### 2. Type System Improvements
**`packages/keychain/src/types/starterpack-types.ts`**
- Simplified `BackendStarterpackDetails` interface:
  - Changed discriminator: `source: "backend"` → `type: "claimed"`
  - Replaced `starterPackItems: StarterPackItem[]` with `items: Item[]`
  - Removed unused fields: `priceUsd`, `supply`, `mintAllowance`, `acquisitionType`
  
- Simplified `OnchainStarterpackDetails` interface:
  - Changed discriminator: `source: "onchain"` → `type: "onchain"`
  - Replaced `items: OnchainItem[]` with `items: Item[]` (unified type)
  - Renamed `OnchainQuote` → `Quote`
  - Removed unused `acquisitionType` field

- Removed obsolete types:
  - `OnchainItem` (replaced by unified `Item` type from context)
  
- Updated type guards:
  - `isBackendStarterpack()` → `isClaimStarterpack()`
  - `detectStarterpackSource()` → `detectStarterpackType()`

#### 3. Hook Separation
**Deleted:**
- `packages/keychain/src/hooks/starterpack.ts` (monolithic hook)

**Created:**
- `packages/keychain/src/hooks/starterpack-claim.ts` - Handles GraphQL-based claimed starterpacks
  - Returns: `{ name, description, items, merkleDrops, isLoading, error }`
  - Converts GraphQL data to unified `Item[]` format
  
**Updated:**
- `packages/keychain/src/hooks/starterpack-onchain.ts` - Handles smart contract starterpacks
  - Renamed from `useStarterPackOnchain` → `useOnchainStarterpack`
  - Returns proper `Quote` and metadata types

#### 4. Context Refactoring
**`packages/keychain/src/context/purchase.tsx`**
- Replaced monolithic hook with separate claim/onchain hooks
- Unified item handling:
  - Removed separate `claimItems` state (now just `items` in `StarterpackDetails`)
  - Simplified item transformation logic
  - Both flows now convert to unified `Item` type early in the pipeline
  
- Updated state management:
  - `starterpack` → `starterpackId`
  - Removed `setPurchaseItems` and `setClaimItems` from public interface (internal only)
  - Removed unused `StarterpackAcquisitionType` import

- Updated dependencies and comments:
  - "Backend dependencies" → "Claim dependencies"
  - "backend vs onchain" → "claimed vs onchain"

**Created:**
- `packages/keychain/src/context/claim.tsx` - New dedicated context for claiming merkle drops
  - Handles claim verification and execution
  - Manages claim state (loading, claimed status, transaction hashes)
  - Supports both EVM and Starknet signature flows

#### 5. Component Updates
**Updated components to use new types:**
- `packages/keychain/src/components/purchase/index.tsx`
- `packages/keychain/src/components/purchase/PaymentMethod.tsx`
- `packages/keychain/src/components/purchasenew/claim/claim.tsx`
- `packages/keychain/src/components/purchasenew/pending.tsx`
- `packages/keychain/src/components/purchasenew/review/cost.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/*.tsx`
- `packages/keychain/src/components/purchasenew/wallet/wallet.tsx`

**Story Files Updated:**
- `packages/keychain/src/components/purchasenew/pending.stories.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/*.stories.tsx`
- `packages/keychain/src/components/purchasenew/success.stories.tsx`

**Deleted:**
- `packages/keychain/src/components/purchase/index.stories.tsx` (will be recreated with new types)

### 🧹 Cleanup

**`packages/controller/src/types.ts`**
- Removed unused `StarterPackItemType` enum
- Removed unused `StarterPackItem` interface
- These types are now handled internally in keychain package

**Removed from context:**
- `StarterpackAcquisitionType` import (no longer needed)
- `setPurchaseItems` and `setClaimItems` from public API (internal state management only)

### 📝 API Changes

#### PurchaseContext Interface Changes
**Removed:**
```typescript
setPurchaseItems: (items: Item[]) => void;
setClaimItems: (items: Item[]) => void;
```

**Renamed:**
```typescript
// Before
setStarterpack: (starterpack: string | number) => void;

// After  
setStarterpackId: (starterpackId: string | number) => void;
```

**Internal Changes:**
```typescript
// Claim flow now returns Items directly from hook
const { name, items, merkleDrops, ... } = useClaimStarterpack(id);

// Items are set in starterpackDetails as-is
setStarterpackDetails({
  type: "claimed",
  items, // Already in Item[] format
  ...
});
```

### 🎯 Benefits

1. **Type Safety**: Proper discriminated unions with `type` field instead of `source`
2. **Code Clarity**: Clear separation between "claimed" (free) and "onchain" (paid) flows
3. **Maintainability**: Dedicated hooks and contexts for each flow
4. **Consistency**: Unified `Item` type used throughout (no more `StarterPackItem`, `OnchainItem`, etc.)
5. **Reduced Complexity**: Removed unused fields and legacy abstractions
6. **Better Naming**: "Claimed" clearly indicates free/merkle drop starterpacks vs "onchain" paid ones

## Migration Notes

### For Developers Using PurchaseContext

**Breaking Changes:**
1. `setStarterpack()` → `setStarterpackId()`
2. `setPurchaseItems()` and `setClaimItems()` removed (handled internally)
3. StarterpackDetails types updated (use type guards to check `type: "claimed" | "onchain"`)

**Type Guard Usage:**
```typescript
import { isClaimStarterpack, isOnchainStarterpack } from '@/types/starterpack-types';

if (isClaimStarterpack(starterpackDetails)) {
  // Access claimed starterpack properties
  const { merkleDrops } = starterpackDetails;
}

if (isOnchainStarterpack(starterpackDetails)) {
  // Access onchain starterpack properties  
  const { quote, imageUri } = starterpackDetails;
}
```

## Files Changed

### Added (2)
- `packages/keychain/src/context/claim.tsx`
- `packages/keychain/src/hooks/starterpack-claim.ts`

### Deleted (2)
- `packages/keychain/src/hooks/starterpack.ts`
- `packages/keychain/src/components/purchase/index.stories.tsx`

### Modified (21)
- `packages/controller/src/types.ts`
- `packages/keychain/src/components/purchase/PaymentMethod.tsx`
- `packages/keychain/src/components/purchase/index.tsx`
- `packages/keychain/src/components/purchase/types.ts`
- `packages/keychain/src/components/purchasenew/claim/claim.tsx`
- `packages/keychain/src/components/purchasenew/pending.stories.tsx`
- `packages/keychain/src/components/purchasenew/pending.tsx`
- `packages/keychain/src/components/purchasenew/review/cost.tsx`
- `packages/keychain/src/components/purchasenew/review/onchain-tooltip.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/collections.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/merkledrop.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/starter-item.stories.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/starter-item.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/starterpack.stories.tsx`
- `packages/keychain/src/components/purchasenew/starterpack/starterpack.tsx`
- `packages/keychain/src/components/purchasenew/success.stories.tsx`
- `packages/keychain/src/components/purchasenew/success.tsx`
- `packages/keychain/src/components/purchasenew/wallet/wallet.tsx`
- `packages/keychain/src/context/index.ts`
- `packages/keychain/src/context/purchase.tsx`
- `packages/keychain/src/hooks/purchase.ts`
- `packages/keychain/src/hooks/starterpack-onchain.ts`
- `packages/keychain/src/types/starterpack-types.ts`
- `packages/keychain/src/utils/api/generated.ts`

## Testing Checklist

- [ ] Claimed starterpack flow works (GraphQL + merkle drops)
- [ ] Onchain starterpack purchase flow works (smart contract)
- [ ] Type guards correctly discriminate between flows
- [ ] Storybook stories render correctly
- [ ] No TypeScript errors
- [ ] All comments and documentation updated
- [ ] Backward compatibility verified (or migration path documented)

