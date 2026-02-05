# Headless Mode Stabilization Plan (Updated)

## Goals
- Enable headless mode via `controller.connect({ username, signer })` (no new APIs).
- Keep authentication logic in keychain and reuse the existing UI flow.
- Support all implemented auth options (password, webauthn, google, discord, walletconnect, metamask, rabby, phantom-evm).
- Provide Playwright E2E coverage for headless passkey + EVM flows.

## Implementation Plan

### 1) SDK + API alignment
- Remove the unreleased `ControllerOptions.headless` constructor field.
- Extend `ConnectOptions` to include:
  - `username` (required for headless)
  - `signer` (auth method)
  - `password` (required for password signer)
- Keep backwards compatibility with `connect(signupOptions)`.
- Update docs + examples to use the new connect API.

### 2) Reuse the UI login flow in keychain
- Remove the standalone headless auth implementation.
- Store headless parameters in the connect callback registry.
- Auto-submit the existing `CreateController` flow when headless params are present:
  - Fetch controller data
  - Use the same login path as UI
  - Create session if policies allow
- If policies require explicit user approval, return `USER_INTERACTION_REQUIRED` early.

### 3) E2E testing with Playwright + MSW
- Add MSW handlers inside keychain and enable them via the E2E entrypoint
  (`pnpm --filter @cartridge/keychain dev:e2e`).
- Add a test-only `Controller` mock via an E2E alias (`controller.e2e.ts`)
  to avoid backend dependencies.
- Add Playwright tests in `examples/next`:
  - Headless passkey login
  - Headless MetaMask login (inject a stub `window.ethereum` in the parent app)

## Validation Checklist
- Headless connect resolves without opening the modal.
- Session creation behavior matches UI (auto-approve only).
- Passkey + EVM headless flows succeed end-to-end under mocks.
- Normal UI connect remains unchanged.
