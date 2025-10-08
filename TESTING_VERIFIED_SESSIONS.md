# Testing Verified Sessions

This guide explains how to test the verified session flow where the CreateSession UI is bypassed.

## What are Verified Sessions?

When a preset is configured with an allowed origin list, and the keychain is accessed from one of those origins, the session is considered "verified". Verified sessions automatically create a session without showing the approval UI.

## How Verification Works

1. **Preset Configuration**: A preset (e.g., "pistols") is loaded from `@cartridge/presets`
2. **Origin Check**: The preset config contains an `origin` field with allowed origins
3. **Verification**: If `window.location.origin` matches an allowed origin, `verified: true` is set
4. **Auto-approval**: In `ConnectRoute`, if `policies.verified === true`, a session is created automatically

## Testing Verified Sessions

### Option 1: Modify the Example Locally

The easiest way to test is to add `localhost:3002` to the pistols preset's allowed origins:

1. **Find your presets package**:
   ```bash
   cd node_modules/.pnpm/@cartridge+presets@<version>/node_modules/@cartridge/presets
   ```

2. **Edit the preset config** (you'll need to find where pistols config is loaded from - it may be fetched remotely)

3. **Add localhost to allowed origins**

### Option 2: Use a Verified Origin

Some presets may already have verified origins configured. Check the preset configs to find one.

### Option 3: Mock for Testing

Add a temporary console.log to see what's happening:

**In `packages/keychain/src/hooks/connection.ts`:**
```typescript
loadConfig(urlParams.preset)
  .then((config) => {
    if (config && config.origin) {
      const allowedOrigins = toArray(config.origin as string | string[]);
      console.log("Preset origins:", allowedOrigins);
      console.log("Current origin:", origin);
      console.log("Is verified:", isOriginVerified(origin, allowedOrigins));
      setVerified(isOriginVerified(origin, allowedOrigins));
      setConfigData(config as Record<string, unknown>);
    }
  })
```

**Then temporarily bypass verification in `ConnectRoute.tsx`:**
```typescript
// Force verified for testing
const testVerified = true; // Set to true to test
if (testVerified || policies?.verified) {
  // Session will be created automatically
}
```

## Expected Behavior

### Unverified Session (Normal Flow)
1. User clicks "Connect"
2. CreateSession UI shows with policy details
3. User must approve or skip
4. Session is created after approval

### Verified Session (Bypassed Flow)
1. User clicks "Connect"
2. **No UI shown** - session created automatically in background
3. Connection completes immediately
4. User sees connected state

## Observing in Browser DevTools

1. Open browser console
2. Click "Connect"
3. For verified sessions, you should see:
   - No CreateSession UI
   - Console log: "Auto-creating verified session"
   - Immediate connection success

## Testing in ConnectRoute

The relevant code in `ConnectRoute.tsx` (lines 165-190):

```typescript
// Bypass session approval screen for verified sessions
if (policies?.verified) {
  const createSessionForVerifiedPolicies = async () => {
    try {
      // Use a default duration for verified sessions (24 hours)
      const duration = BigInt(24 * 60 * 60);
      const expiresAt = duration + now();

      const processedPolicies = processPolicies(policies, false);
      await controller.createSession(expiresAt, processedPolicies);
      params.resolve?.({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });
      cleanupCallbacks(params.params.id);
      handleCompletion();
    } catch (e) {
      console.error("Failed to create verified session:", e);
      params.reject?.(e);
    }
  };

  void createSessionForVerifiedPolicies();
}
```

## Verifying the Fix

After the routing migration, verified sessions should:
- ✅ Still auto-create without showing UI
- ✅ Use the correct policies from the preset
- ✅ Complete successfully
- ✅ Handle errors gracefully (fall back to showing UI if auto-creation fails)
