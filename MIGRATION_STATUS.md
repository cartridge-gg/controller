# Migration Status: app_id Parameter Changes

## Overview

This document tracks the status of the migration to move `app_id` from account constructors to session-specific operations.

## Current Status: ⚠️ BLOCKED

The TypeScript wrapper code has been updated to match the new API described in the migration guide. However, the migration is currently **BLOCKED** because:

1. The `@cartridge/controller-wasm` package (currently v0.3.19) still uses the OLD API
2. The WASM package needs to be updated FIRST with the new signatures
3. Once the WASM package is updated, this code will work correctly

## Changes Made

### ✅ Completed in TypeScript Layer

1. **Controller class** (`packages/keychain/src/utils/controller.ts`):
   - Added `_appId` private field to store app_id
   - Updated `appId()` to return `_appId` instead of calling `cartridgeMeta.appId()`
   - Updated all session methods to pass `app_id` as first parameter:
     - `createSession()`
     - `skipSession()`
     - `registerSessionCalldata()`
     - `registerSession()`
     - `trySessionExecute()`
     - `hasAuthorizedPoliciesForCalls()`
     - `hasAuthorizedPoliciesForMessage()`
     - `hasRequestedSession()` (calls `hasRequestedSession` on WASM side)
   - Updated factory methods to work with new WASM signatures:
     - `Controller.apiLogin()` - moves app_id to end (optional parameter)
     - `Controller.create()` - removes app_id from CartridgeAccount.new() call
     - `Controller.login()` - moves app_id to end (optional parameter)
     - `Controller.fromStore()` - removes app_id from ControllerFactory.fromStorage() call
   - All factory methods now store app_id in `_appId` field

## Build Status

Current build fails with:
```
src/utils/controller.ts(150,7): error TS2554: Expected 3 arguments, but got 4.
src/utils/controller.ts(315,7): error TS2554: Expected 6 arguments, but got 7.
```

These errors are EXPECTED because the WASM package hasn't been updated yet.

## Required WASM Package Changes

The `@cartridge/controller-wasm` package needs to be updated to version **0.4.0** (or appropriate next version) with the following changes:

### Constructor Changes (remove app_id)
- `CartridgeAccount.new()` - remove `app_id` as first parameter
- `ControllerFactory.fromStorage()` - remove `app_id` parameter
- `ControllerFactory.login()` - move `app_id` to end as optional parameter
- `ControllerFactory.apiLogin()` - move `app_id` to end as optional parameter

### Session Method Changes (add app_id as first parameter)
- `cartridge.createSession(app_id, policies, expiresAt, ...)`
- `cartridge.skipSession(app_id, policies)`
- `cartridge.registerSessionCalldata(app_id, policies, expiresAt, publicKey)`
- `cartridge.registerSession(app_id, policies, expiresAt, publicKey, authorization, maxFee)`
- `cartridge.trySessionExecute(app_id, calls, feeSource)`
- `cartridge.hasAuthorizedPoliciesForCalls(app_id, calls)`
- `cartridge.hasAuthorizedPoliciesForMessage(app_id, typedData)`
- `cartridge.hasRequestedSession(app_id, policies)`

### Metadata Changes
- Remove `appId()` method from `CartridgeAccountMeta`

## Next Steps

1. ⏳ **Wait for WASM package update** - The Rust/WASM team needs to implement the changes in `@cartridge/controller-wasm`
2. 📦 **Update package version** - Once available, update `pnpm-workspace.yaml` to use the new WASM package version
3. ✅ **Verify build** - Run `pnpm build` to ensure everything compiles
4. 🧪 **Run tests** - Execute `pnpm test` to verify functionality
5. 🎨 **Run linting** - Execute `pnpm lint && pnpm format` to ensure code quality

## Testing Checklist (for after WASM update)

- [ ] Account creation works without passing app_id
- [ ] Session creation requires and uses app_id correctly
- [ ] All session operations (register, skip, execute) work with app_id
- [ ] Policy checks use app_id for proper isolation
- [ ] Multiple apps can share a single controller instance
- [ ] Storage keys use correct format: `@cartridge/policies/{address}/{app_id}/{chain_id}`
- [ ] Examples still work correctly
- [ ] Tests pass

## Benefits of This Migration

Once complete, this migration will enable:
1. **Single Shared Controller**: One controller instance can serve multiple applications
2. **Better Resource Sharing**: Reduces memory footprint
3. **Clearer Separation**: Controller identity vs application identity
4. **Multi-App Support**: Natural support for platforms hosting multiple applications
5. **Flexible Session Management**: Sessions explicitly tied to apps

## Rollback Plan

If needed, the TypeScript changes can be reverted by:
```bash
git checkout packages/keychain/src/utils/controller.ts
```

This will restore compatibility with the current WASM package (v0.3.19).
