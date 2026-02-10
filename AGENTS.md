<!-- SKILLS_INDEX_START -->
[Agent Skills Index]|root: ./agents|IMPORTANT: Prefer retrieval-led reasoning over pre-training for any tasks covered by skills.|skills|agent-browser:{agent-browser.md},clean-build:{clean-build.md},code-review:{code-review.md},codegen:{codegen.md},create-a-plan:{create-a-plan.md},create-pr:{create-pr.md},dispatch-release:{dispatch-release.md},find-skills:{find-skills.md},package-filter:{package-filter.md},pre-commit-check:{pre-commit-check.md},release-prep:{release-prep.md},run-tests:{run-tests.md},test:{test.md},update-pr:{update-pr.md},update-storybook-snapshots:{update-storybook-snapshots.md},validate-before-merge:{validate-before-merge.md}
<!-- SKILLS_INDEX_END -->
# Repository Guidelines

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

-   `pnpm dev` - Starts all development servers in parallel:
    -   localhost:3001 (Keychain)
    -   localhost:3002 (Next.js example)
    -   localhost:5174 (Svelte example)
-   `pnpm build` - Builds all packages and dependencies
-   `pnpm storybook` - Launches Storybook for component development

### Testing

-   `pnpm test` - Runs keychain test suite (Vitest)
-   `pnpm test:ci` - Runs tests in CI mode
-   `pnpm test:storybook` - Runs Storybook visual regression tests
-   `pnpm test:storybook:update` - Updates Storybook snapshots (requires Docker)
-   `pnpm e2e` - Runs end-to-end tests with Playwright (currently disabled in CI)
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

-   **Frontend**: React 18, TypeScript 5.7, Next.js 15.3, Svelte, TailwindCSS 3.4, Vite 6.0
-   **Blockchain**: StarkNet 8.5.4, starknet.js, @starknet-react/core 5.0.1
-   **Testing**: Vitest 2.1.8, Jest 29, Playwright, Storybook 8.5
-   **Build**: Turbo, tsup, pnpm workspaces (v10) with catalog for deps
-   **Authentication**: WebAuthn/Passkeys, Session Tokens, Auth0, Turnkey

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
-   For UI changes, update keychain (`packages/keychain/`) as needed
-   Test integration with examples in `examples/next/` or `examples/svelte/`

**Debugging Integration Issues:**

-   Use browser dev tools with local keychain at <http://localhost:3001>
-   Account import/export via `window.cartridge.exportAccount()` and `window.cartridge.importAccount()`
-   Check iframe communication between controller and keychain

**Monorepo Navigation:**

-   Use `pnpm --filter <package-name>` to run commands in specific packages
-   Common filters: `@cartridge/controller`, `@cartridge/keychain`, `@cartridge/connector`
-   Dependencies are automatically linked via workspace protocol

### Testing Strategy

-   **Unit tests** in individual packages (Vitest for keychain, Jest for others)
-   **Visual regression** via Storybook snapshots (Docker-based in CI)
-   **E2E testing** with Playwright for full user flows (Note: currently disabled in CI)
-   **Integration testing** via example applications
-   **Pre-commit hooks** enforce formatting and linting (Husky)

### Key Files to Check When Making Changes

-   `packages/controller/src/index.ts` - Main SDK exports
-   `packages/keychain/src/components/` - UI components for wallet operations
-   `packages/keychain/src/utils/api/codegen.yaml` - GraphQL codegen configuration
-   `turbo.json` - Build dependencies and caching configuration
-   `pnpm-workspace.yaml` - Package workspace configuration
-   `.husky/pre-commit` - Pre-commit hooks for code quality

### Build Process Notes

-   **WASM Dependencies**: controller-wasm and session-wasm built via `build:deps` task
-   **Dual Builds**: Controller package has separate browser (Vite) and Node.js (tsup) builds
-   **GraphQL Codegen**: Automatically runs during keychain build
-   **Turbo Caching**: Aggressive caching for faster builds, use `pnpm clean` if issues arise

## Agent Tooling

- **Pre-commit hooks:** run `bin/setup-githooks` (configures `core.hooksPath` for this repo).

- **Source of truth:** `.agents/`.
- **Symlinks:** `CLAUDE.md` is a symlink to this file (`AGENTS.md`). Editor/agent configs should symlink skills from `.agents/skills`.
- **Skills install/update:**

```bash
npm_config_cache=/tmp/npm-cache npx -y skills add https://github.com/cartridge-gg/agents   --skill create-pr create-a-plan   --agent claude-code cursor   -y
```

- **Configs:**
  - `.agents/skills/` (canonical)
  - `.claude/skills` -> `../.agents/skills`
  - `.cursor/skills` -> `../.agents/skills`

## Code Review Invariants

- No secrets in code or logs.
- Keep diffs small and focused; avoid drive-by refactors.
- Add/adjust tests for behavior changes; keep CI green.
- Prefer check-only commands in CI (`format:check`, `lint:check`) and keep local hooks aligned.
- For Starknet/Cairo/Rust/crypto code: treat input validation, authZ, serialization, and signature/origin checks as **blocking** review items.
