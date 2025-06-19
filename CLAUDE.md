# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

-   `pnpm dev` - Starts all development servers in parallel:
    -   localhost:3002 (Next.js example)
    -   localhost:5174 (Svelte example) 
    -   localhost:3001 (Keychain)
    -   localhost:3003 (Profile)
-   `pnpm build` - Builds all packages and dependencies
-   `pnpm storybook` - Launches Storybook for component development

### Testing

-   `pnpm test` - Runs keychain test suite
-   `pnpm test:ci` - Runs tests in CI mode
-   `pnpm test:storybook` - Runs Storybook visual regression tests
-   `pnpm e2e` - Runs end-to-end tests with Playwright
-   `pnpm e2e:ui` - Runs E2E tests with UI

### Code Quality

-   `pnpm lint` - Runs linting and format checking
-   `pnpm format` - Runs formatting and lint fixes

### Package Management

-   `pnpm i` - Install dependencies
-   `pnpm clean` - Clean all build artifacts and prune store
-   `corepack enable pnpm` - Enable pnpm via corepack

## Architecture Overview

### Project Structure

This is a **monorepo** using **pnpm workspaces** and **Turbo** for build orchestration. The project implements a gaming-specific smart contract wallet ecosystem for StarkNet.

### Core Packages (`/packages/`)

**Primary Applications:**

-   **`controller/`** - Main SDK implementing StarkNet account interfaces. Implements account abstractions and communicates with embedded keychain iframe for secure operations.
-   **`keychain/`** - Sandboxed React app (<https://x.cartridge.gg/>) responsible for sensitive operations like transaction signing, user authentication, and key management.
-   **`profile/`** - React app (<https://profile.cartridge.gg/>) for displaying account state, balances, activities, and achievements.
-   **`connector/`** - Lightweight connector interface for easy integration with StarkNet React applications.

**Supporting Packages:**

-   **`eslint/`** - Shared ESLint configuration
-   **`tsconfig/`** - Shared TypeScript configuration
-   **`torii-config/`** - Token metadata configuration

### Integration Examples (`/examples/`)

-   **`next/`** - Next.js integration example with full transaction signing
-   **`svelte/`** - Svelte integration example
-   **`node/`** - Node.js server-side usage example

### Technology Stack

-   **Frontend**: React, TypeScript, Next.js, Svelte, TailwindCSS, Vite
-   **Blockchain**: StarkNet, starknet.js
-   **Testing**: Jest, Playwright, Storybook
-   **Build**: Turbo, pnpm workspaces
-   **Authentication**: WebAuthn/Passkeys, Session Tokens

### Security Architecture

The project uses an **iframe-based security model** where:

-   Sensitive operations (key management, signing) occur in the sandboxed keychain iframe
-   Controller SDK communicates with keychain via secure postMessage
-   Session tokens enable seamless gaming UX while maintaining security
-   WebAuthn/Passkeys provide passwordless authentication

### Development Workflow

1.  **Monorepo Dependencies**: `pnpm dev` automatically handles workspace dependencies
2.  **Visual Testing**: Storybook provides component isolation and visual regression testing
3.  **Account Import**: For local development, export accounts from production keychain using `window.cartridge.exportAccount()` and import with `window.cartridge.importAccount()`

### Key Integration Points

-   **Multi-wallet Support**: Integrates with MetaMask, Solana wallets, etc.
-   **Session Management**: Gaming-optimized session tokens for reduced signing friction
-   **GraphQL Data Layer**: Account information and state management
-   **Stripe Integration**: Fiat payment processing
-   **Cross-platform**: Web, mobile WebView support

### File Architecture Notes

-   **Storybook snapshots** in `__image_snapshots__/` for visual regression testing
-   **Example apps** demonstrate various integration patterns

## Claude Code Workflow Guidelines

### Code Quality Requirements

-   **Always run linting/formatting** before committing: `pnpm lint` and `pnpm format`
-   **TypeScript compliance** - All TypeScript errors must be resolved
-   **Test coverage** - Run relevant tests after making changes: `pnpm test` for unit tests, `pnpm test:storybook` for visual regression

### Common Development Tasks

**Working with Components:**

-   After modifying components, run `pnpm storybook` to verify visually
-   Update Storybook snapshots with `pnpm test:storybook:update` if needed

**Adding New Features:**

-   Check existing patterns in `packages/controller/src/` for SDK features
-   For UI changes, update both keychain (`packages/keychain/`) and profile (`packages/profile/`) as needed
-   Test integration with examples in `examples/next/` or `examples/svelte/`

**Debugging Integration Issues:**

-   Use browser dev tools with local keychain at <http://localhost:3001>
-   Account import/export via `window.cartridge.exportAccount()` and `window.cartridge.importAccount()`
-   Check iframe communication between controller and keychain

**Monorepo Navigation:**

-   Use `pnpm --filter <package-name>` to run commands in specific packages
-   Common filters: `@cartridge/controller`, `@cartridge/keychain`, `@cartridge/profile`, `@cartridge/connector`
-   Dependencies are automatically linked via workspace protocol

### Testing Strategy

-   **Unit tests** in individual packages (Jest)
-   **Visual regression** via Storybook snapshots
-   **E2E testing** with Playwright for full user flows
-   **Integration testing** via example applications

### Key Files to Check When Making Changes

-   `packages/controller/src/index.ts` - Main SDK exports
-   `packages/keychain/src/components/` - UI components for wallet operations  
-   `turbo.json` - Build dependencies and caching
-   `pnpm-workspace.yaml` - Package workspace configuration
