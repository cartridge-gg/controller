---
title: StarkNet.js 0.7.x Migration Guide
description: Guide for migrating from StarkNet.js v6.x to v7.x when using Cartridge Controller
---

# StarkNet.js 0.7.x Migration Guide

This guide helps you migrate from StarkNet.js v6.x to v7.x when using Cartridge Controller. The upgrade introduces several breaking changes that require code updates.

## Overview

StarkNet.js 0.7.x is a major release that introduces significant breaking changes:

- **Type reorganization**: Types are now exported from `@starknet-io/types-js`
- **API changes**: Method signatures have been updated
- **Fee structure**: New fee estimation structure with separate L1/L2 gas pricing
- **Import changes**: Some imports have moved to new packages

## Dependencies Update

### Update package.json

Update your dependencies to use the new versions:

```json
{
  "dependencies": {
    "starknet": "^7.6.2",
    "@starknet-io/types-js": "^0.8.4",
    "@cartridge/controller": "^0.8.0",
    "@cartridge/connector": "^0.8.0"
  }
}
```

### Install new dependencies

```bash
npm install @starknet-io/types-js@^0.8.4
npm update starknet
```

## Breaking Changes

### 1. Type Imports

**Before (v6.x):**
```typescript
import { SIGNATURE, TypedData } from "starknet";
```

**After (v7.x):**
```typescript
import { SPEC } from "@starknet-io/types-js";
import { TypedData } from "starknet";

// SIGNATURE is now SPEC.SIGNATURE
type Signature = SPEC.SIGNATURE;
```

### 2. Provider Interface Types

**Before (v6.x):**
```typescript
import {
  AddInvokeTransactionParameters,
  StarknetWindowObject,
  WalletEventHandlers
} from "starknet";
```

**After (v7.x):**
```typescript
import {
  AddInvokeTransactionParameters,
  StarknetWindowObject, 
  WalletEventHandlers
} from "@starknet-io/types-js";
```

### 3. Method Signatures

The `execute` method no longer accepts an `abis` parameter:

**Before (v6.x):**
```typescript
await account.execute(calls, abis, { maxFee });
```

**After (v7.x):**
```typescript
await account.execute(calls);
```

### 4. Fee Structure Changes

Fee estimation now includes separate L1 and L2 gas pricing:

**Before (v6.x):**
```typescript
interface FeeEstimate {
  gas_consumed: bigint;
  gas_price: bigint;
  overall_fee: bigint;
}
```

**After (v7.x):**
```typescript
interface EstimateFee {
  l1_gas_consumed: bigint;
  l1_gas_price: bigint;
  l2_gas_consumed: bigint;
  l2_gas_price: bigint;
  l1_data_gas_consumed: bigint;
  l1_data_gas_price: bigint;
  overall_fee: bigint;
  unit: string;
}
```

## Migration Steps

### Step 1: Update Dependencies

```bash
# Update package.json as shown above, then:
npm install
```

### Step 2: Update Imports

Replace all imports from `starknet` for types that have moved:

```typescript
// Update these imports
import {
  SIGNATURE,           // → SPEC.SIGNATURE from @starknet-io/types-js
  Permission,         // → from @starknet-io/types-js
  RequestFn,          // → from @starknet-io/types-js
  // ... other types
} from "starknet";

// To this:
import { SPEC, Permission, RequestFn } from "@starknet-io/types-js";
import { WalletAccount, Call } from "starknet";
```

### Step 3: Update Type Usage

Replace `SIGNATURE` with `SPEC.SIGNATURE`:

```typescript
// Before
async function signMessage(typedData: TypedData): Promise<SIGNATURE> {
  // ...
}

// After  
async function signMessage(typedData: TypedData): Promise<SPEC.SIGNATURE> {
  // ...
}
```

### Step 4: Update Method Calls

Remove the `abis` parameter from `execute` calls:

```typescript
// Before
const result = await account.execute(calls, contractAbis);

// After
const result = await account.execute(calls);
```

### Step 5: Update Fee Handling

If you're working with fee estimates, update your code to use the new structure:

```typescript
// Before
const gasPrice = feeEstimate.gas_price;

// After
const l1GasPrice = feeEstimate.l1_gas_price;
const l2GasPrice = feeEstimate.l2_gas_price;
```

## Testing Your Migration

After making these changes:

1. **Build your project** to catch any remaining type errors
2. **Run your tests** to ensure functionality is preserved
3. **Test wallet connections** and transactions
4. **Verify fee estimation** works correctly

## Common Issues

### TypeScript Errors

If you see TypeScript errors about missing types:

```
Cannot find name 'SIGNATURE'
```

Make sure you've updated the import:

```typescript
import { SPEC } from "@starknet-io/types-js";
// Use SPEC.SIGNATURE instead of SIGNATURE
```

### Runtime Errors

If you see runtime errors about undefined methods or properties:

- Check that you've removed all `abis` parameters from `execute` calls
- Verify fee estimation code uses the new structure
- Ensure all imports are from the correct packages

## Need Help?

If you encounter issues during migration:

1. Check the [StarkNet.js release notes](https://github.com/starknet-io/starknet.js/releases) for detailed breaking changes
2. Review the [Controller examples](/controller/examples/react) for updated code patterns
3. Join the [Cartridge Discord](https://discord.gg/cartridge) for community support

## Example: Complete Migration

Here's an example showing a complete migration:

**Before (v6.x):**
```typescript
import { SIGNATURE, TypedData, WalletAccount } from "starknet";

class MyWallet extends WalletAccount {
  async signMessage(typedData: TypedData): Promise<SIGNATURE> {
    // Implementation
  }
  
  async executeTransaction(calls: Call[], abis?: Abi[]) {
    return await this.execute(calls, abis);
  }
}
```

**After (v7.x):**
```typescript
import { SPEC, TypedData } from "@starknet-io/types-js";
import { WalletAccount } from "starknet";

class MyWallet extends WalletAccount {
  async signMessage(typedData: TypedData): Promise<SPEC.SIGNATURE> {
    // Implementation
  }
  
  async executeTransaction(calls: Call[]) {
    return await this.execute(calls);
  }
}
```

This migration ensures your application works with the latest StarkNet.js version while maintaining compatibility with Cartridge Controller.