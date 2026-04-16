# Changelog

## [0.13.12] - 2026-04-16

### ✨ New Features
- **@cartridge/keychain**: Added transaction simulation with balance change calculations for ERC-20, ERC-721, and ERC-1155 tokens, displaying balance differences, allowances, and approval statuses in transaction summaries (#2547)
- **@cartridge/keychain**: Added Coinflow payment integration for starterpack credit card payments, replacing Stripe with email verification flow and direct USDC settlement (#2544)
- **@cartridge/controller**: Added preset support to node SessionProvider with automatic policy resolution from `@cartridge/presets`, enabling `preset: "my-game"` configuration (#2459)
- **@cartridge/keychain**: Added delete account option to settings, enabling users to permanently remove their accounts with username confirmation (#2534)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced Coinflow checkout flow to use verified account email instead of manual input, requiring email verification before card payment (#2550)
- **@cartridge/keychain**: Enhanced Stripe payment form with verified name fields pre-populated from identity verification, ensuring billing details match verification data (#2541)
- **@cartridge/keychain**: Disabled Stripe payments for starterpacks in preparation for Coinflow migration (#2543)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed OAuth signup/login failures in preset environments by deferring URL parameter restoration until after authentication completes, preventing component unmounting during signup (#2551)
- **@cartridge/keychain**: Fixed login screen header to always show close button instead of non-functional back button when navigation history exists (#2546)
- **@cartridge/keychain**: Fixed BroadcastChannel communication with Coinbase popup by replacing with postMessage for Safari iframe compatibility (#2533)
- **@cartridge/keychain**: Removed noisy Focus/Change Username PostHog events that generated excessive analytics noise during account creation (#2545)

### 📦 Dependencies
- **@coinflowlabs/react**: Added Coinflow SDK for credit card payment processing integration (#2544)

## [0.13.11] - 2026-04-03

### ✨ New Features
- **@cartridge/keychain**: Added delete account option to settings, enabling users to permanently remove their accounts from the platform (#2534)
- **@cartridge/keychain**: Added CustomerSession client secret support for Stripe Elements, enabling enhanced payment security (#2531)
- **@cartridge/keychain**: Added auto-fallback payment token functionality with persistent selection, improving payment flow reliability when primary tokens fail (#2527)
- **@cartridge/keychain**: Added IP-based location detection to replace geolocation, providing more reliable location services (#2526)
- **@cartridge/keychain**: Added US map display with blocked states in location gate for enhanced compliance visualization (#2522)
- **@cartridge/keychain**: Added keychain location prompt functionality enabling location-based features and services (#2349)
- **@cartridge/keychain**: Added date of birth (DOB) verification to Stripe payment flow for enhanced compliance (#2510)
- **@cartridge/keychain**: Added SMS authentication to signup/login flows, providing phone-based OTP authentication (#2500)
- **@cartridge/keychain**: Added swap detection for AVNU and LayerSwap (LS2) protocols for better transaction recognition (#2493)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced payment flows with hardcoded clientPercentage set to 0 for bundle payments, reducing costs for users (#2523)
- **@cartridge/keychain**: Improved Safari popup blocked error messaging with clearer guidance for browser settings (#2506)
- **@cartridge/keychain**: Enhanced Coinbase phone input format to match Stripe verification requirements (#2517)
- **@cartridge/keychain**: Improved payment UI by renaming "Stripe Checkout" to "Credit Card" for clarity (#2509)
- **@cartridge/keychain**: Enhanced location gate verification to enforce checks before connect resolves (#2525)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed BroadcastChannel communication issues by replacing with postMessage for Coinbase popup (#2533)
- **@cartridge/keychain**: Fixed session controller disconnect issues preventing proper session cleanup (#2537)
- **@cartridge/keychain**: Fixed hidden password fields on mobile devices for better accessibility (#2535)
- **@cartridge/keychain**: Fixed Coinbase popup autoclose functionality on payment success (#2532)
- **@cartridge/keychain**: Fixed payment token fallback failures when primary tokens are unavailable (#2530)
- **@cartridge/keychain**: Fixed Stripe auto-fallback behavior for non-US users to prevent inappropriate fallbacks (#2529)
- **@cartridge/keychain**: Fixed KYC verification gating to restrict to US users only (#2528)
- **@cartridge/keychain**: Fixed starterpack closure issues for improved stability (#2516)
- **@cartridge/keychain**: Fixed controller layout updates and spending limit loading states (#2515)
- **@cartridge/keychain**: Fixed Apple Pay support errors in Coinbase checkout by properly ignoring expected "not supported" messages (#2514)
- **@cartridge/keychain**: Fixed WASM error handling and updated controller-wasm to v0.10.0 (#2502)

### 📦 Dependencies
- **@cartridge/controller-wasm**: Updated to version 0.10.0 for improved WASM functionality and error handling (#2502)
- **Turnkey SDKs**: Upgraded browser SDKs to version 5 for enhanced security and performance (#2499)

## [0.13.11-alpha.2] - 2026-03-30

### ✨ New Features
- **@cartridge/keychain**: Added keychain location prompt functionality with geolocation API via iframe, enabling location-based features and services (#2349)
- **@cartridge/keychain**: Added starter pack social claim functionality with X (Twitter) account integration, allowing users to follow and share game accounts to claim bundles (#2498)
- **@cartridge/keychain**: Added date of birth (DOB) verification to Stripe payment flow for enhanced compliance and verification (#2510)
- **@cartridge/keychain**: Added SMS authentication to signup/login flows, providing phone-based OTP authentication as an alternative to passkeys and social logins (#2500)
- **@cartridge/keychain**: Added swap detection for AVNU and LayerSwap (LS2) protocols, enabling better transaction recognition and displaying swap review screens (#2493)

### 🚀 Improvements
- **@cartridge/keychain**: Improved Safari popup blocked error messaging with user-friendly guidance for enabling popups in browser settings (#2506)
- **@cartridge/keychain**: Enhanced Coinbase payment flow by renaming "Stripe Checkout" to "Credit Card" for clearer user understanding (#2509)
- **@cartridge/keychain**: Removed feature gate for Stripe checkout in starterpacks, making credit card payments generally available (#2508)
- **@cartridge/keychain**: Improved Coinbase phone input format to match Stripe verification with disabled country code dropdown for consistency (#2517)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed keychain disconnection issues by ensuring proper disconnect sequence before state changes, preventing users from remaining logged in after disconnect (#2505)
- **@cartridge/keychain**: Enhanced WASM error handling with structural error message reading for both native Error objects and WASM error-like objects (#2502)
- **@cartridge/keychain**: Fixed Apple Pay not supported errors in Coinbase checkout by ignoring expected "not supported" messages while preserving real error handling (#2514)
- **@cartridge/keychain**: Fixed starterpack closure issues for improved stability (#2516)
- **@cartridge/keychain**: Fixed spending limit loading states and sign-up password form getting stuck, plus miscellaneous controller layout improvements (#2515)
- **@cartridge/keychain**: Removed Storage Access API console logs to reduce console noise in production environments (#2507)
- **@cartridge/keychain**: Removed quests functionality to streamline the user interface (#2501)

### 📦 Dependencies
- **@cartridge/controller-wasm**: Updated to version 0.10.0 for improved WASM functionality and error handling (#2502)
- **Turnkey SDKs**: Upgraded browser SDKs to version 5 (`@turnkey/sdk-browser` to v5.15.2, `@turnkey/sdk-react` to v5.5.6) for enhanced OTP flow support (#2499)

## [0.13.11-alpha.1] - 2026-03-26

### ✨ New Features
- **@cartridge/keychain**: Added starter pack social claim functionality for enhanced social integration and reward distribution (#2498)
- **@cartridge/keychain**: Added SMS authentication to signup/login flows, providing an additional authentication method for improved accessibility (#2500)
- **@cartridge/keychain**: Added swap detection for AVNU and LayerSwap (LS2) protocols, enabling better transaction recognition and user experience (#2493)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced Safari popup blocked error messaging to provide clearer guidance for Safari users experiencing popup issues (#2506)
- **@cartridge/keychain**: Improved payment UI by renaming "Stripe Checkout" to "Credit Card" for clearer user understanding (#2509)
- **@cartridge/keychain**: Removed feature gate for Stripe checkout in starterpacks, making credit card payments generally available (#2508)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed keychain disconnection to properly disconnect before emitting state changes, preventing race conditions (#2505)
- **@cartridge/keychain**: Enhanced WASM error handling and updated controller-wasm to v0.10.0 for improved stability (#2502)
- **@cartridge/keychain**: Removed Storage Access console logs to reduce console noise in production environments (#2507)
- **@cartridge/keychain**: Removed quests functionality to streamline the user interface (#2501)

### 📦 Dependencies
- **controller-wasm**: Updated to version 0.10.0 for improved WASM functionality and error handling (#2502)
- **Turnkey browser SDKs**: Upgraded to version 5 for enhanced security and performance (#2499)

## [0.13.10] - 2026-03-19

### ✨ New Features
- **@cartridge/keychain**: Added identity verification for Stripe purchases, enabling enhanced security and compliance for payment processing (#2492)
- **@cartridge/keychain**: Added geofencing for OFAC countries on Vercel, ensuring compliance with international sanctions requirements (#2484)
- **@cartridge/keychain**: Added Stripe checkout for starterpacks, providing seamless payment integration for starter pack purchases (#2485)
- **@cartridge/keychain**: Added BroadcastChannel-based communication for Coinbase popup, replacing GraphQL polling for more efficient real-time updates (#2451)
- **@cartridge/keychain**: Added embedded Coinbase payment in keychain popup with status polling for streamlined payment experience (#2445)
- **@cartridge/keychain**: Added Apple Pay triple-click functionality on review purchase icon for faster mobile payments (#2457)
- **@cartridge/controller**: Added `updateSession` API for runtime session policy updates, enabling dynamic modification of session policies (#2440)
- **@cartridge/keychain**: Added account parameter support on session page for improved session flow configuration (#2439)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced Stripe payment integration with improved Coinbase popup handling, message validation, and status polling (#2449, #2447, #2453, #2454)
- **@cartridge/keychain**: Improved token selection with split USDC and USDC.e support in starterpack flows for better token identification (#2470)
- **@cartridge/keychain**: Enhanced popup authentication for restrictive iframe environments with better fallback handling (#2462)
- **@cartridge/keychain**: Improved mobile authentication with better Chrome iOS handling and WebAuthn debugging capabilities (#2429, #2428, #2427)
- **@cartridge/controller**: Enhanced EVM wallet detection and provider discovery for improved multi-wallet compatibility (#2468)
- **@cartridge/keychain**: Streamlined payment GraphQL migration to controller for better architecture (#2464)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed human-readable error messages for FailedPrecondition errors, showing clearer user-facing messages instead of generic service errors (#2496)
- **@cartridge/keychain**: Fixed back button functionality on verification pages for better navigation experience (#2495)
- **@cartridge/keychain**: Fixed profile history query performance by adding caps and gating fetches to prevent excessive API calls (#2490)
- **@cartridge/keychain**: Fixed execute submit error propagation to prevent hanging during transaction execution (#2488)
- **@cartridge/keychain**: Fixed credits purchase alignment with Stripe GraphQL for consistent payment processing (#2483)
- **@cartridge/controller**: Fixed WebAuthn permissions in Permissions-Policy header for proper passkey functionality (#2482)
- **@cartridge/controller**: Fixed custom-scheme redirect_uri preservation in standalone session flows for mobile app compatibility (#2481)
- **@cartridge/controller**: Fixed domain verification to check both redirect_url and redirect_uri parameters (#2474)
- **@cartridge/controller**: Fixed unknown signers error handling to prevent error screens (#2472)
- **@cartridge/controller**: Fixed custom URL scheme verification for mobile app integration (#2471)
- **@cartridge/controller**: Fixed loading spinner display while preset config loads (#2477)
- **@cartridge/controller**: Fixed connect flow reliability and removed console errors for cleaner operation (#2438, #2437)
- **@cartridge/controller**: Fixed disconnect method to properly reset iframe state (#2434)

### 📦 Dependencies
- **controller-wasm**: Updated to version 0.9.6 for improved backend functionality (#2479)
- **controller-rs**: Updated to version 0.9.5 for enhanced performance (#2465)
- **@cartridge/ui**: Multiple updates for improved design consistency and functionality (#2489, #61e0634d)

## [0.13.10-alpha.1] - 2026-02-25

### ✨ New Features
- **@cartridge/controller**: Added `updateSession` API for runtime session policy updates, enabling dynamic modification of session policies during runtime for improved flexibility (#2440)
- **@cartridge/keychain**: Added account parameter support on session page, allowing developers to pass account information directly to session flows (#2439)
- **@cartridge/keychain**: Enhanced activity tab with comprehensive review functionality for improved user activity tracking (#2413)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed connect flow to ensure reliable connection establishment and prevent connection failures (#2438)
- **@cartridge/controller**: Removed console errors for cleaner debugging experience and improved production logging (#2437)
- **@cartridge/controller**: Fixed disconnect method to properly call `close()` and reset iframe state, ensuring clean disconnection and preventing stale iframe issues (#2434)
- **@cartridge/keychain**: Fixed Stripe.js Content Security Policy by adding script-src allowlist entry, enabling proper Stripe integration for payment processing (#2433)
- **@cartridge/keychain**: Fixed Continue button display on Chrome iOS when automatic session creation fails, ensuring users can still proceed with manual session creation (#2429)
- **@cartridge/keychain**: Prioritized iOS detection before hasPlatformAuthenticator check for WebAuthn, improving passkey creation reliability on iOS devices (#2428)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced WebAuthn debugging by capturing options via PostHog for iOS troubleshooting and analytics (#2427)
- **@cartridge/keychain**: Removed WebAuthn debug logging to reduce console noise in production environments (#2430)

### 🔧 Development
- **CI/CD**: Added auto-merge functionality for docs-sync PRs after checks pass for improved documentation workflow (#2432)
- **CI/CD**: Refined docs-sync process for more concise and accurate documentation updates (#2431)

## [0.13.9] - 2026-02-16

### 🚀 Improvements
- **@cartridge/controller**: Enhanced iOS WebAuthn support with explicit creation options and improved debug logging for more reliable passkey creation on iOS devices (#2421)
- **@cartridge/controller**: Streamlined build process by removing redundant build script in controller package for improved development workflow (#2423)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed quest toast notifications by removing them to prevent user interface clutter and improve user experience (#2425)
- **@cartridge/controller**: Improved passkey creation flow for Chrome iOS by implementing direct iframe approach instead of popup flow for better mobile compatibility (#2419, #2420)
- **@cartridge/controller**: Enhanced iOS passkey creation reliability by setting authenticatorAttachment to platform for improved device authentication (#2417)

### 🔧 Testing
- **@cartridge/controller**: Added comprehensive Capacitor session redirect E2E tests to prevent regressions in session ingestion and account creation flows (#2424)
- **@cartridge/controller**: Added regression tests for controller disconnect localStorage cleanup functionality (#2414)

### 📦 Dependencies
- **controller-wasm**: Updated to version 0.9.4 for improved backend functionality (#2418)
- **Dependencies**: Updated ERC metadata dependencies for better token support (#2422)

## [0.13.8] - 2026-02-13

### ✨ New Features
- **@cartridge/controller**: Added new mainnet USDC token support with legacy USDC.e labeling for improved token identification (#94dae94e)

### 🚀 Improvements
- **@cartridge/controller**: Enhanced connection policy resolution by fixing preset theme and custom policy override precedence, allowing apps to maintain preset-derived configuration while explicitly overriding preset policies (#2408)
- **@cartridge/controller**: Improved maintainability by extracting hardcoded "startapp" query parameter into `REDIRECT_QUERY_NAME` constant following Telegram mini app convention (#2412)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed `SessionProvider.probe()` returning undefined after `ingestSessionFromRedirect()` by restoring on-demand session retrieval for deep link redirects in Capacitor and mobile apps (#2409)
- **Token Configuration**: Reverted mainnet USDC token support changes to restore legacy behavior for token metadata and mainnet token indexing entries (#2410)

### 🔧 Testing
- **@cartridge/controller**: Added comprehensive regression tests for controller disconnect localStorage cleanup functionality (#2414)

## [0.13.7] - 2026-02-12

### ✨ New Features
- **@cartridge/controller**: Added `lookupUsername(username)` method for headless flows, returning account existence status and normalized signer options for the controller's configured chain (#2400)
- **@cartridge/controller**: Added auto-signup functionality for headless connect when a username is missing, while maintaining strict signer matching for existing accounts (#2400)
- **@cartridge/connector**: Exposed `lookupUsername` helper method through ControllerConnector for easier integration with starknet-react applications (#2400)

### 🚀 Improvements
- **Documentation**: Updated HEADLESS_MODE.md with recommended lookup-first flow patterns for improved developer guidance (#2400)
- **Testing**: Added comprehensive test coverage for username lookup normalization, error handling, and password-based headless auto-signup flows (#2400)

## [0.13.6] - 2026-02-12

### 🚀 Improvements
- **@cartridge/controller**: Enhanced SessionProvider preset support with automatic policy resolution from `@cartridge/presets`, enabling developers to use `preset: "my-game"` instead of manually duplicating policies and ensuring consistent policy hashing between SDK and keychain (#2401)
- **Documentation**: Updated project structure documentation with comprehensive provider flows, clarified ControllerProvider (web) and SessionProvider (native) architecture, and improved examples directory guidance (#2404)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed `session/not-registered` errors by normalizing contract addresses in policy hashing and consolidating async initialization to prevent policy hash divergence between SDK and keychain (#2401)
- **@cartridge/keychain**: Fixed theme copy button visibility in ErrorAlert component by replacing hardcoded black icons with theme-aware styling, ensuring proper visibility on dark backgrounds (#2402)

## [0.13.5] - 2026-02-10

### ✨ New Features
- **@cartridge/controller**: Added headless mode support to controller SDK for seamless authentication, allowing `connect({ username, signer, password? })` with hidden keychain iframe and UI-less authentication flows (#2315)
- **@cartridge/controller**: Added `close()` method to ControllerProvider for programmatic cleanup of controller instances (#2373)
- **@cartridge/controller**: Moved `asWalletStandard()` method from connector to controller package, enabling wallet standard usage without starknet-react dependency (#2364)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced session management with exposed session GUID fields (`allowedPoliciesRoot`, `metadataHash`, `sessionKeyGuid`, `guardianKeyGuid`) in keychain callback payloads for registered sessions (#2396)
- **@cartridge/keychain**: Consolidated policy handling by refactoring `toWasmPolicies` into single source of truth for improved consistency (#2394)
- **@cartridge/keychain**: Enhanced quests and achievements display to only show tabs when game/application supports them (#2392)
- **@cartridge/keychain**: Improved starterpack purchase UI to always show quantity in purchase button for better user clarity (#2390)
- **@cartridge/connector**: Improved disconnect handling to keep `@starknet-react/core` state in sync with controller state (#2315)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed session authentication to properly disconnect and re-authenticate when session `rpc_url` differs from stored controller, ensuring correct chain targeting (#2395)
- **@cartridge/controller**: Enhanced iframe security by hardening keychain iframe loading with URL validation, origin pinning, and reduced feature grants by default (#2384)
- **@cartridge/keychain**: Added keychain CSP/security headers and removed inline scripts from index.html for improved security posture (#2384)

### 📦 Dependencies
- **controller-rs**: Updated to v0.9.3 for improved backend functionality (#2397)

## [0.13.4] - 2026-02-06

### 🐛 Bug Fixes
- **CI/CD**: Fixed npm publishing with catalog resolution by reverting to pnpm publish, which correctly handles pnpm catalog: protocol that npm publish doesn't support, ensuring proper package resolution in published packages (#77210c65)

### 🔧 Development
- **Agent Tooling**: Added standardized agent/dev tooling with `.agents/` directory as source of truth, Claude/Cursor skill compatibility symlinks, and enhanced pre-commit hooks for improved development workflow (#2388)

## [0.13.3] - 2026-02-06

### ✨ New Features
- **@cartridge/controller**: Added starterpack play callback functionality enabling custom game launch behavior and improved gaming integration (#2362)
- **@cartridge/controller**: Added specialized controller toast notifications with improved messaging and user feedback for iframe-embedded applications (#2358)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced iframe connect flow with automatic Storage Access API request for improved cross-domain authentication in WebView environments (#2374)
- **@cartridge/keychain**: Tightened Capacitor origin verification to only auto-verify localhost, requiring explicit authorization for custom hostnames in presets for enhanced security (#2375)
- **@cartridge/controller**: Improved policy handling with canonical sorting before hashing to ensure consistent policy processing and prevent non-deterministic merkle root calculations (#2359)
- **@cartridge/controller**: Enhanced preset verification for Capacitor environments with better validation and support for capacitor:// scheme (#2369)

### 🐛 Bug Fixes
- **@cartridge/controller**: Added ApprovalPolicy support to controller toWasmPolicies for proper merkle root calculation across different connectors, fixing session registration mismatches (#2372)
- **@cartridge/controller**: Fixed aggregate contracts display on unverified session to properly group methods into "Approve <game>" expendable cards (#2304)
- **@cartridge/controller**: Fixed controller re-initialization issues by reusing existing controller instances to prevent duplicate iframes and message channels (#2360)
- **@cartridge/controller**: Fixed chain ID lookup to support non-Cartridge chain configurations for better multi-chain compatibility (#2361)
- **@cartridge/keychain**: Fixed Coinbase sandbox configuration to ensure proper sandbox environment setup (#2371)
- **@cartridge/keychain**: Fixed password login button alignment with primary theme for consistent UI styling (#2385)

## [0.13.2] - 2026-02-06

### 🐛 Bug Fixes
- **@cartridge/controller, @cartridge/connector**: Added repository field to package.json files for npm OIDC trusted publishing, ensuring proper package verification and supply chain security (#c9c6f25d)

## [0.13.1] - 2026-02-06

### 🐛 Bug Fixes
- **CI/CD**: Fixed npm publishing with OIDC authentication by switching from pnpm publish to npm publish and removing registry-url from setup-node to prevent .npmrc conflicts that block OIDC token exchange (#3880e8ba)

## [0.13.0] - 2026-02-06

### ✨ New Features
- **@cartridge/controller**: Added ApprovalPolicy support to controller toWasmPolicies for enhanced policy management and proper merkle root calculation across different connectors (#2372)
- **@cartridge/controller**: Added starterpack play callback functionality enabling custom game launch behavior and improved gaming integration (#2362)
- **@cartridge/controller**: Added specialized controller toast notifications with improved messaging and user feedback for iframe-embedded applications (#2358)

### 🚀 Improvements
- **@cartridge/keychain**: Enhanced iframe connect flow with automatic Storage Access API request for improved cross-domain authentication in WebView environments (#2374)
- **@cartridge/keychain**: Tightened Capacitor origin verification to only auto-verify localhost, requiring explicit authorization for custom hostnames in presets for enhanced security (#2375)
- **@cartridge/controller**: Improved policy handling with canonical sorting before hashing to ensure consistent policy processing and prevent non-deterministic merkle root calculations (#2359)
- **@cartridge/controller**: Enhanced preset verification for Capacitor environments with better validation and support for capacitor:// scheme (#2369)
- **Development**: Migrated npm publishing to OIDC authentication with supply chain provenance attestation for enhanced security (#2381)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed aggregate contracts display on unverified session to properly group methods into "Approve <game>" expendable cards (#2304)
- **@cartridge/controller**: Fixed controller re-initialization issues by reusing existing controller instances to prevent duplicate iframes and message channels (#2360)
- **@cartridge/controller**: Fixed chain ID lookup to support non-Cartridge chain configurations for better multi-chain compatibility (#2361)
- **@cartridge/keychain**: Fixed Coinbase sandbox configuration to ensure proper sandbox environment setup (#2371)
- **CI/CD**: Fixed release workflow race conditions by inlining changelog generation into release dispatch workflow (#2379)

## [0.12.3] - 2026-02-05

### ✨ New Features
- **@cartridge/keychain**: Added Capacitor origin verification tightening for enhanced security in mobile environments (#2375)
- **@cartridge/controller**: Added specialized controller toast notifications with improved messaging and user feedback (#2358)
- **@cartridge/controller**: Added ApprovalPolicy support to controller toWasmPolicies for enhanced policy management (#2372)
- **@cartridge/controller**: Added starterpack play callback functionality for improved gaming integration (#2362)

### 🚀 Improvements  
- **@cartridge/keychain**: Enhanced iframe connect flow with automatic storage access request for improved cross-domain authentication (#2374)
- **@cartridge/controller**: Improved policy handling with canonical sorting before hashing to ensure consistent policy processing (#2359)
- **@cartridge/controller**: Enhanced preset verification for Capacitor environments with better validation (#2369)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed aggregate contracts on unverified session to prevent session-related issues (#2304)
- **@cartridge/keychain**: Fixed Coinbase sandbox configuration to ensure proper sandbox environment setup (#2371)
- **@cartridge/controller**: Fixed controller re-initialization issues by reusing existing controller instances (#2360)
- **@cartridge/controller**: Fixed chain ID lookup to support non-Cartridge chain configurations (#2361)

## [0.12.2] - 2026-01-29

### ✨ New Features
- **Examples**: Added Capacitor session example with iOS app integration, demonstrating mobile session management and providing comprehensive cross-platform development guidance (#2355)
- **@cartridge/keychain**: Enhanced Coinbase onramp integration with `createCoinbaseLayerswapOrder` mutation for improved order creation and processing (#2354)
- **@cartridge/keychain**: Added comprehensive cost breakdown display for Apple Pay purchases, showing detailed fee structure including Coinbase fees and bridge fees with real-time pricing from Coinbase Onramp API (#2352)
- **@cartridge/keychain**: Added starterpack Apple Pay checkout functionality for streamlined mobile payments (#2339)
- **@cartridge/keychain**: Implemented verification autofill functionality for improved user experience during authentication flows (#2342)
- **@cartridge/keychain**: Added order fetching by IDs capability for enhanced order management and tracking (#2334)

### 🚀 Improvements  
- **@cartridge/keychain**: Removed supported-platforms feature gate, making platform detection generally available (#2335)
- **Development**: Migrated skills documentation to centralized `.agents/skills` directory for better organization and AI-assisted development workflows (#2353)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed 'proceed with caution' warning visibility for slot login flows, improving user experience (#2351)
- **@cartridge/keychain**: Fixed purchase token layout issues for better visual consistency (#2343)
- **@cartridge/keychain**: Fixed Layerswap username retrieval from authentication context for proper user identification (#2347)
- **@cartridge/keychain**: Fixed Coinbase Terms of Service link for proper legal compliance (#2341)
- **@cartridge/keychain**: Fixed Coinbase query handling for improved API integration (#2338)

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates for improved design consistency and functionality (#2350, #2348, #2346, #2345, #2344, #2337)

## [0.12.1] - 2026-01-07

### ✨ New Features
- **@cartridge/controller**: Added configurable error display modes with `errorDisplayMode` option, enabling developers to control how transaction errors are presented to users with three modes: `modal` (default), `notification` (clickable toast), and `silent` (console only) (#2312)

### 🚀 Improvements  
- **Development**: Enhanced Claude Code integration with structured skill guides for code review, PR management, testing, Storybook snapshots, and release workflows (#2311, #2310)
- **Documentation**: Expanded CLAUDE.md with detailed technology stack versions, build process explanations, and comprehensive development workflow guidance (#2310)

### 🔧 Development
- **Build**: Added .worktrees to .gitignore for improved Git worktree support (#2311)
- **Claude Integration**: Added comprehensive permissions configuration and skill documentation for streamlined AI-assisted development (#2311, #2310)

## [0.12.0] - 2026-01-01

### ✨ New Features
- **@cartridge/controller**: Added dynamic `signupOptions` to `connect()` method, enabling developers to override constructor configuration per connection and create multiple branded authentication flows (e.g., "Login with Phantom", "Login with Google") using a single Controller instance (#2298)
- **@cartridge/keychain**: Added wallet selection drawer for onchain checkout, replacing navigation-based flow with inline slide-up drawer for more seamless UX (#2294)
- **@cartridge/keychain**: Added Coinbase onramp integration with `useCoinbase` hook for order creation, transaction queries, and requirement checks with automatic client IP detection (#2296)
- **@cartridge/keychain**: Added support for additional payment tokens in starterpack metadata, allowing creators to specify custom payment options beyond default ETH, STRK, and USDC (#2292)

### 🚀 Improvements  
- **@cartridge/controller**: Enhanced paymaster error handling with graceful fallback to user-pays flow when paymaster is unavailable due to rate limits, execution timing, or other conditions (#2291)
- **@cartridge/keychain**: Improved authentication flows with branded button text for single-signer configurations and configurable signup authentication methods (#2290)
- **@cartridge/keychain**: Enhanced session management by restoring wildcard session creation during login flows for better user experience (#2302, #637faa12)
- **@cartridge/keychain**: Updated Ekubo integration to use new chain ID-based API format for improved swap functionality (#2287)
- **@cartridge/keychain**: Improved session footer styling with proper padding and button text updates from "Create Session" to "Continue" (#2274)

### 🐛 Bug Fixes
- **@cartridge/controller**: Restored `propagateSessionErrors` functionality for contract execution, ensuring errors are properly propagated back to callers instead of showing manual approval modal when enabled (#2305)
- **@cartridge/keychain**: Fixed starterpack loading flicker by showing proper loading states during loading/onchain/preimage states (#2297)
- **@cartridge/keychain**: Fixed collection pagination issues for better user experience (#2301)
- **@cartridge/keychain**: Fixed session management by reverting and then restoring wildcard session creation during register session login for optimal user flow (#2299, #2302)
- **@cartridge/keychain**: Fixed Ekubo API CORS issues by specifying proper CORS headers and credentials handling (#2288)

### 📦 Dependencies
- **@cartridge/ui**: Updated to latest commits for improved design consistency and React 19 peer dependency support (#2295, #2260)

## [0.11.4-alpha.1] - 2025-12-31

### ✨ New Features
- **@cartridge/controller**: Added dynamic `signupOptions` to `connect()` method, enabling developers to override constructor configuration per connection and create multiple branded authentication flows (e.g., "Login with Phantom", "Login with Google") using a single Controller instance (#2298)
- **@cartridge/keychain**: Added wallet selection drawer for onchain checkout, replacing navigation-based flow with inline slide-up drawer for more seamless UX (#2294)
- **@cartridge/keychain**: Added Coinbase onramp integration with `useCoinbase` hook for order creation, transaction queries, and requirement checks with automatic client IP detection (#2296)
- **@cartridge/keychain**: Added support for additional payment tokens in starterpack metadata, allowing creators to specify custom payment options beyond default ETH, STRK, and USDC (#2292)

### 🚀 Improvements  
- **@cartridge/controller**: Enhanced paymaster error handling with graceful fallback to user-pays flow when paymaster is unavailable due to rate limits, execution timing, or other conditions (#2291)
- **@cartridge/keychain**: Improved authentication flows with branded button text for single-signer configurations and configurable signup authentication methods (#2290, #1b4423c3)
- **@cartridge/keychain**: Enhanced session management by restoring wildcard session creation during login flows for better user experience (#2302, #637faa12)
- **@cartridge/keychain**: Updated Ekubo integration to use new chain ID-based API format for improved swap functionality (#2287)
- **@cartridge/keychain**: Improved session footer styling with proper padding and button text updates from "Create Session" to "Continue" (#2274)

### 🐛 Bug Fixes
- **@cartridge/controller**: Restored `propagateSessionErrors` functionality for contract execution, ensuring errors are properly propagated back to callers instead of showing manual approval modal when enabled (#2305)
- **@cartridge/keychain**: Fixed starterpack loading flicker by showing proper loading states during loading/onchain/preimage states (#2297)
- **@cartridge/keychain**: Fixed collection pagination issues for better user experience (#2301)
- **@cartridge/keychain**: Fixed controlled Select component warnings in cost breakdown by using proper value handling (#2294)
- **@cartridge/keychain**: Fixed Ekubo API CORS issues by specifying proper CORS headers and credentials handling (#2288)

### 🔧 Refactoring
- **Development**: Multiple UI component updates and dependency management improvements (#2295, #2260)
- **@cartridge/keychain**: Simplified authentication flows by removing complex route-based session skipping logic in favor of consistent wildcard session creation (#2286, #2285)

### 📦 Dependencies
- **@cartridge/ui**: Updated to latest commits for improved design consistency and React 19 peer dependency support

## [0.11.3] - 2025-12-10

### ✨ New Features
- **@cartridge/keychain**: Added Layerswap cross-chain deposit integration for onchain checkout with balance checks, bridging actions, and UI for conversion/liquidity errors (#2273)
- **@cartridge/controller**: Added Phantom EVM wallet authentication method extending EthereumWalletBase, enabling login and signup with Phantom's EVM-compatible mode (#2278)
- **@cartridge/controller**: Added toast notification API with ToastType and ToastOptions interfaces, enabling toast creation from the controller SDK (#2265)
- **@cartridge/keychain**: Added quests functionality for enhanced gaming features (#2280)

### 🚀 Improvements  
- **@cartridge/keychain**: Enhanced onchain purchase flow with multi-network wallet selection, improved cost breakdown displaying Layerswap fees, and streamlined navigation (#2273)
- **@cartridge/keychain**: Improved purchase context architecture by splitting into flow-specific contexts (StarterpackContext, OnchainPurchaseContext, CreditPurchaseContext) for better maintainability (#2270)
- **@cartridge/keychain**: Enhanced authentication flows to skip wildcard session creation during register session login, reducing friction from two signatures to one (#2275)
- **@cartridge/keychain**: Reverted controller iframe dismiss behavior to prevent accidental closure when clicking outside (#2277)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed network selection flicker by adding detection state to suppress empty UI while detecting external wallets (#2272)
- **@cartridge/keychain**: Fixed Turnkey nonce mismatch errors by clearing cached Auth0 tokens before nonce generation, ensuring fresh tokens with correct nonces (#2271)
- **@cartridge/controller**: Added payment permission to iframe allow attribute for proper Stripe Payment Request API access, enabling Apple Pay and Google Pay support (#2269)
- **@cartridge/keychain**: Reduced Ekubo API console noise by removing verbose 429 logging and adjusting retry/backoff configurations for better rate limit handling (#2268)

### 🔧 Refactoring
- **Development**: Removed build:compat infrastructure and associated dependencies, simplifying build configuration across packages (#2279)

## [0.11.3-alpha.2] - 2025-12-10

### ✨ New Features
- **@cartridge/keychain**: Added Layerswap cross-chain deposit integration for onchain checkout with balance checks, bridging actions, and UI for conversion/liquidity errors (#2273)
- **@cartridge/controller**: Added Phantom EVM wallet authentication method extending EthereumWalletBase, enabling login and signup with Phantom's EVM-compatible mode (#2278)
- **@cartridge/controller**: Added toast notification API with ToastType and ToastOptions interfaces, enabling toast creation from the controller SDK (#2265)
- **@cartridge/keychain**: Added quests functionality for enhanced gaming features (#2280)

### 🚀 Improvements  
- **@cartridge/keychain**: Enhanced onchain purchase flow with multi-network wallet selection, improved cost breakdown displaying Layerswap fees, and streamlined navigation (#2273)
- **@cartridge/keychain**: Improved purchase context architecture by splitting into flow-specific contexts (StarterpackContext, OnchainPurchaseContext, CreditPurchaseContext) for better maintainability (#2270)
- **@cartridge/keychain**: Enhanced authentication flows to skip wildcard session creation during register session login, reducing friction from two signatures to one (#2275)
- **@cartridge/keychain**: Reverted controller iframe dismiss behavior to prevent accidental closure when clicking outside (#2277)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed network selection flicker by adding detection state to suppress empty UI while detecting external wallets (#2272)
- **@cartridge/keychain**: Fixed Turnkey nonce mismatch errors by clearing cached Auth0 tokens before nonce generation, ensuring fresh tokens with correct nonces (#2271)
- **@cartridge/controller**: Added payment permission to iframe allow attribute for proper Stripe Payment Request API access, enabling Apple Pay and Google Pay support (#2269)
- **@cartridge/keychain**: Reduced Ekubo API console noise by removing verbose 429 logging and adjusting retry/backoff configurations for better rate limit handling (#2268)

### 🔧 Refactoring
- **Development**: Removed build:compat infrastructure and associated dependencies, simplifying build configuration across packages (#2279)

## [0.11.3-alpha.1] - 2025-12-01

### ✨ New Features
- **@cartridge/keychain**: Added DevConnect booster pack claim integration with Merkle claim functionality, enabling users to claim DevConnect rewards through preimage-derived EVM addresses (#2249)
- **@cartridge/keychain**: Streamlined onchain starterpack purchase flow with direct checkout navigation, removing intermediate screens and defaulting to controller wallet for faster transactions (#2200)
- **@cartridge/keychain**: Added horizontal carousel for booster pack cards on mobile devices, providing swipeable navigation and improved touch experience (#2253)
- **@cartridge/keychain**: Added localStorage availability check for booster packs to ensure proper functionality across different environments (#2259)
- **@cartridge/keychain**: Added tournament game links integration for enhanced gaming navigation (#2252)
- **@cartridge/keychain**: Implemented token IDs retrieval from claim transactions for better transaction tracking (#2255)

### 🚀 Improvements  
- **@cartridge/keychain**: Simplified redirect logic in ConnectRoute for more streamlined authentication flows (#2248)
- **@cartridge/keychain**: Enhanced claim interactions for mystery assets with improved user feedback (#2257)
- **@cartridge/keychain**: Restored claim call functionality for improved transaction processing (#2254)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed iframe local network access by adding `local-network-access *` to iframe allow attribute, enabling proper local development (#2266)
- **@cartridge/keychain**: Fixed merkle claim UI stuck issue preventing users from completing claim flows (#2261)
- **@cartridge/keychain**: Fixed token icon retrieval from presets for consistent token display (#2258)
- **@cartridge/keychain**: Added redirect URL support for WebAuthn authentication, improving authentication flow reliability (#2250)
- **@cartridge/keychain**: Fixed Turnkey popup navigation to keychain for better authentication routing (#2247)
- **@cartridge/keychain**: Updated ConnectRoute tests to match simplified redirect logic for improved test reliability (#2263)
- **@cartridge/keychain**: Fixed input format issues for better form validation (#2251)
- **@cartridge/keychain**: Fixed event parsing to only handle mystery item events properly (#2256)

## [0.11.2] - 2025-11-14

### ✨ New Features
- **@cartridge/keychain**: Implemented encrypted localStorage snapshot for Storage Access API using split-key encryption architecture, eliminating Cookie Store API dependency and enabling secure state transfer across third-party iframe boundaries (#2239)

### 🚀 Improvements  
- **@cartridge/keychain**: Enhanced iOS popup reliability with retry logic, exponential backoff, and stability checks for improved authentication flow on iOS devices (#2244)
- **@cartridge/keychain**: Updated booster pack claim flow with improved component structure and better user experience (#2240)
- **@cartridge/keychain**: Enhanced debug logging with comprehensive Turnkey authentication logs for better troubleshooting (#2241)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed popup error handling by preventing thrown errors on blocked popups, maintaining original flow behavior for mobile compatibility (#2243)
- **@cartridge/keychain**: Reverted popup error logging to address reliability issues and maintain stable authentication flows (#2242, #2238)
- **@cartridge/keychain**: Fixed claim pill size display issues for better visual consistency (#2226)
- **@cartridge/keychain**: Fixed default image handling bug in booster pack components (#2225)
- **@cartridge/keychain**: Updated game links for improved navigation and user experience (#2224)
- **@cartridge/keychain**: Enhanced dynamic height CSS for better responsive design (#2233)
- **@cartridge/keychain**: Improved localStorage and dead-path cookie synchronization for standalone flows (#2232)
- **@cartridge/keychain**: Removed deprecated controller_redirect functionality to streamline authentication flows (#2230)
- **@cartridge/keychain**: Simplified storage access request logic for more reliable cross-domain authentication (#2229)
- **@cartridge/controller**: Refactored session creation to load controller from store for improved session management (#2228)
- **Development**: Fixed environment variable loading for live environment configuration (#2227)

### 📦 Dependencies
- **Development**: Added Storybook story for StandaloneConnect component for improved component testing and documentation (#2231)

## [0.11.2-alpha.4] - 2025-11-13

### ✨ New Features
- **@cartridge/keychain**: Added booster pack claim page for DevConnect rewards, enabling users to claim credits, tokens, and NFTs using private keys from reward URLs with comprehensive signature validation and post-claim actions (#2160)

### 🚀 Improvements  
- **@cartridge/controller**: Refactored session architecture to move app_id from account constructors to session-specific operations, enabling a single shared controller instance to serve multiple applications through app-specific sessions (#2220)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed standalone authentication flow storage access issues by adding debug logging for redirect detection, updating StandaloneConnect UI with generic permission messages, and removing pre-authenticated account display for improved security and clarity (#2217)

### 📦 Dependencies
- **@cartridge/ui**: Updated to commit df8934d for improved design consistency and functionality (#2218)

## [0.11.2-alpha.3] - 2025-11-12

### ✨ New Features
- **@cartridge/controller**: Added `signupOptions` support to SessionProvider, enabling developers to configure which authentication methods (Google, Discord, MetaMask, etc.) are available during session creation and bringing SessionProvider feature parity with ControllerProvider (#2219)

## [0.11.2-alpha.2] - 2025-11-11

### 🚀 Improvements
- **@cartridge/controller**: Refactored `openStarterPack` method signature to accept an options object instead of direct parameters, making the API more extensible for future additions (#2213)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed standalone auth flow storage access by implementing dedicated `controller_storage_ready` parameter for redirect detection and automatic Storage Access API requests, enabling seamless cross-domain authentication flow (#2212)
- **@cartridge/keychain**: Reverted Turnkey nonce mismatch fix to address reliability issues (#2215)

## [0.11.2-alpha.1] - 2025-11-11

### ✨ New Features
- **@cartridge/keychain**: Added Ethereum preimage signing for Merkle claims, enabling users to claim tokens using a preimage when external wallets are not available or preferred (#2185)

### 🚀 Improvements  
- **@cartridge/controller**: Refactored `openStarterPack` method signature to accept an options object instead of direct parameters, making the API more extensible for future additions (#2213)
- **@cartridge/keychain**: Simplified game redirect URLs in PlayButton component to use cleaner parameter format with direct game URLs (#2209)
- **Development**: Disabled Vite visualizer auto-open in production builds to streamline the build process (#2211)
- **Examples**: Added Nums game integration to the PlayButton component with appropriate redirect and preset configuration (#2206)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed Turnkey nonce mismatch by persisting nonce in localStorage across Auth0 redirects, resolving iframe recreation issues during the authentication flow (#2210)

### 📦 Dependencies
- **@cartridge/controller-wasm**: Updated to version 0.3.17 for improved functionality (#2207)

## [0.11.0] - 2025-11-10

### ✨ New Features
- **@cartridge/controller**: Added controller_redirect parameter for standalone flow, enabling automatic redirect to keychain for first-party storage access with preset support (#2192)
- **@cartridge/keychain**: Added Layerswap deposit support for starterpack purchases, replacing backend purchase flow with more flexible deposit-based approach (#2194)
- **@cartridge/keychain**: Added transaction hash display on success screen for onchain purchases, improving transaction transparency and user feedback (#2186)
- **@cartridge/keychain**: Added balance_of fallback and enhanced error handling for token balance checks, improving reliability of token balance queries (#2178)
- **Development**: Added conductor.json workspace configuration for improved development workflow (#2195)

### 🚀 Improvements  
- **@cartridge/keychain**: Refactored starterpack architecture to separate claim and onchain flows with clearer terminology - "backend" starterpacks renamed to "claimed" starterpacks for better clarity (#2199)
- **@cartridge/keychain**: Enhanced standalone flow with automatic connector detection from redirect flow, improving user experience (#2189)
- **@cartridge/keychain**: Improved mobile detection logic for better cross-platform compatibility (#2175)
- **@cartridge/keychain**: Redesigned starterpack receiving and success screens for improved user experience (#2183)
- **@cartridge/keychain**: Enhanced transaction cancellation handling when navigating back from transaction flows (#2180)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed torii token configuration for improved token handling (#2201)
- **@cartridge/keychain**: Fixed session auto-creation redirect timing in standalone authentication flow (#2196)
- **@cartridge/keychain**: Fixed preset verification in standalone flow for more reliable preset validation (#2191)
- **@cartridge/keychain**: Fixed URL search parameter preservation in connect route to maintain state during navigation (#2188)
- **@cartridge/keychain**: Fixed achievement display issues for better user profile experience (#2181)

### 🔧 Refactoring
- **@cartridge/controller**: Removed unused onAuthenticationSuccess callback to streamline authentication flow (#2197)
- **@cartridge/keychain**: Deprecated CryptoCheckout component in favor of new Layerswap deposit approach (#2194)

### 📦 Dependencies
- **@cartridge/ui**: Updated to latest version for improved design consistency (#2190, #2182)

## [0.10.7] - 2025-10-01

### ✨ New Features
- **@cartridge/controller**: Added async/await pattern for controller initialization, providing better error handling and improved developer experience (#2070)
- **@cartridge/keychain**: Added disconnect redirect URL support for session provider, enabling better session management and app navigation (#2074)

### 🚀 Improvements  
- **@cartridge/keychain**: Removed deprecated layout style overrides across components for cleaner UI rendering (#2040)
- **@cartridge/keychain**: Extracted keychain URL logic into dedicated function for better code organization and maintainability (#2071)
- **@cartridge/keychain**: Enhanced bottom navigation to preserve query parameters during navigation (#2072)
- **@cartridge/keychain**: Improved token sorting in ERC20 lists for better user experience (#2083)
- **Development**: Enforced React hook dependencies for improved code quality (#2065)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed Ethereum wallet availability on mobile browsers by adding mobile detection to prevent unsupported wallet initialization (#2076)
- **@cartridge/keychain**: Fixed BigInt serialization errors in execute URL parameters by adding proper JSON serialization handling (#2084)
- **@cartridge/keychain**: Resolved circular dependency and BigInt handling issues in starterpack components (#2085)
- **@cartridge/keychain**: Fixed starterpack crypto cost breakdown display for accurate pricing information (#2081)
- **@cartridge/keychain**: Fixed controller loading state management for smoother user experience (#2078)
- **@cartridge/keychain**: Fixed authentication method types for improved type safety (#2073)
- **@cartridge/keychain**: Fixed inventory display issues and asset collection rendering (#2069, #2068)

### 📦 Dependencies
- **@cartridge/presets**: Updated to latest version for improved functionality (#2077)

## [0.10.6] - 2025-09-26

### ✨ New Features
- **@cartridge/keychain**: Added marketplace integration with consolidated arcade provider functionality, streamlining marketplace operations and improving the gaming marketplace experience (#2063)
- **@cartridge/keychain**: Added disconnect page with redirect deeplink support, enabling better session management and seamless app navigation (#2056)
- **@cartridge/keychain**: Implemented dynamic RPC URL override support for enhanced flexibility in network configuration, allowing developers to specify custom RPC endpoints dynamically (#2052)

### 🚀 Improvements  
- **@cartridge/controller**: Enhanced Android native flow session provider with improved error handling and better session management reliability (#2066)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed purchase flow to use correct network icon, ensuring users see the appropriate network indicator during transactions (#2055)
- **@cartridge/keychain**: Fixed verified session creation to improve session validation and authentication flow reliability (#2062)
- **@cartridge/keychain**: Fixed game theme functionality for better theming consistency across gaming applications (#2050)

### 📦 Dependencies
- **Dojo**: Updated to latest version for improved gaming framework functionality (#2057)

## [0.10.5] - 2025-09-20

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed session key GUID registration by adding proper signerToGuid generation and debug logging to SessionAccount constructor, ensuring proper session registration for Node.js provider (#2047)
- **@cartridge/keychain**: Fixed USDC payment type box visibility on Starter Pack pages by removing redundant USDC denomination badge from cost breakdown display (#2046)
- **@cartridge/keychain**: Fixed claim wallet detection to properly identify available wallets during claiming process, improving wallet selection reliability (#2045)
- **@cartridge/keychain**: Fixed starter pack UI by removing unintentional hover states from non-selectable starter items and hiding unnecessary icons in starter pack page header (#2026)

## [0.10.4] - 2025-09-18

### ✨ New Features
- **@cartridge/keychain**: Added cookie-based authentication for already connected accounts, improving user experience by maintaining login state across sessions (#2039)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed external wallet availability detection to handle cases where StarkNet window objects are not immediately available on initialization, ensuring reliable StarkNet wallet detection (#2043)

## [0.10.3] - 2025-09-17

### ✨ New Features
- **@cartridge/keychain**: Added native social login functionality, enabling seamless authentication in native applications (#2010)
- **@cartridge/keychain**: Implemented robust retry logic with exponential backoff for transaction waiting operations, improving reliability for both external wallet and StarkNet transactions (#2032)
- **@cartridge/keychain**: Enhanced starter pack and cost breakdown UI with improved tooltips, verified/unverified edition support, and better item display (#1982)

### 🚀 Improvements  
- **@cartridge/keychain**: Migrated all explorer URLs from StarkScan to Cartridge Explorer for consistent block exploration experience (#1883)
- **@cartridge/controller**: Improved nested execution error parsing to extract meaningful error messages from deeply nested JSON-RPC responses, showing specific contract errors instead of generic messages (#2033)
- **@cartridge/keychain**: Enhanced RPC error display in ExecutionContainer to show clean error descriptions instead of full JSON responses (#2023)
- **@cartridge/keychain**: Improved token ordering and balance handling for better user experience (#2029, #2024)
- **Dependencies**: Updated presets package and various UI components for improved functionality

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed social authentication redirect URL handling for improved login reliability (#2035)
- **@cartridge/keychain**: Added comprehensive error handling to claim operations to prevent silent failures (#2030)
- **@cartridge/keychain**: Fixed cost component display to only show for paid starter packs, removing confusing cost breakdown from free claims (#2025)
- **@cartridge/keychain**: Fixed various UI regressions including useEffect dependencies, wallet integration, and controller creation flows (#2028, #2027)
- **@cartridge/keychain**: Fixed token balance display issues for accounts with no prior interactions (#2024)
- **@cartridge/keychain**: Resolved minor asset display issues in collection components (#2019)
- **@cartridge/keychain**: Fixed total claimable amount calculation (#2018)

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates for improved design consistency and functionality
- **controller-rs**: Updated to latest version for enhanced backend functionality
- **Various**: Updated workspace dependencies and lockfile maintenance

## [0.10.2] - 2025-09-11

### ✨ New Features
- **@cartridge/keychain**: Added environment-based configuration for merkle drop contracts enabling flexible contract deployment across different environments (#2008)

### 🚀 Improvements  
- **@cartridge/keychain**: Migrated 6 transaction flows to use ExecutionContainer for direct execution, eliminating page redirects and providing inline transaction confirmation for improved UX (#2005)
- **@cartridge/keychain**: Enhanced session update prompting logic with better validation and synchronous rendering for improved transaction flow performance (#2007)
- **Examples**: Cleaned up Next.js example Profile component by removing collection-related buttons (#2011)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed chain switching to always execute on request, ensuring reliable network changes (#2014)
- **@cartridge/keychain**: Fixed login validation to prevent authentication before controller username validation is complete (#2012)
- **@cartridge/keychain**: Fixed session creation flash issues for smoother session management (#2009)
- **@cartridge/keychain**: Fixed Braavos wallet chain switching by adding proper skip logic (#2006)
- **@cartridge/keychain**: Fixed merkle drop claim interface to properly display claim amounts (#2004)

## [0.10.1] - 2025-09-10

### ✨ New Features
- **@cartridge/keychain**: Added StarkNet wallets account changed listener for improved wallet integration and event handling (#1999)
- **@cartridge/keychain**: Enhanced claim UI to display connected wallet address for better user transparency (#2000)
- **@cartridge/keychain**: Added starterpack ID input support to example application for easier testing and development (#1998)
- **@cartridge/keychain**: Implemented merkle drop StarkNet claim signature verification for enhanced security (#1993)
- **@cartridge/keychain**: Added merkle-drop wallet selection with controller integration for streamlined claiming process (#1986)
- **@cartridge/controller**: Added outsideExecution support to StarterPack API for improved transaction handling (#1972)
- **@cartridge/controller**: Migrated collection listing to use ExecutionContainer for direct execution, improving performance (#2002)

### 🚀 Improvements  
- **@cartridge/controller**: Enhanced fee estimation by scaling resource bounds by 1.5x for more reliable transaction processing (#1978)
- **@cartridge/keychain**: Restricted token support to only USDC, ETH, LORDS and STRK tokens for improved security and user experience (#1996)
- **Development**: Added dev:live scripts for production API testing to streamline development workflow (#2001)

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed controller crash after purchase to ensure stable operation (#1997)
- **@cartridge/keychain**: Resolved inventory assets disappearing after tab navigation (#1990)
- **@cartridge/keychain**: Fixed navigation stack reset issues in collection components (#1995)
- **@cartridge/keychain**: Fixed loot box image display issues (#1991)
- **@cartridge/keychain**: Resolved inventory view problems after purchase completion (#1989)
- **@cartridge/keychain**: Fixed token page empty state display (#1988)

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates for improved design consistency and functionality (#1994, #1992)

## [0.10.0] - 2025-09-03

### ✨ New Features
- **@cartridge/keychain**: Added starterpack claim merkle drop functionality, enabling efficient and secure starterpack distribution through merkle tree verification (#1928)
- **@cartridge/controller**: Re-implemented controller creation factory pattern for improved instantiation and configuration management (#1956)
- **@cartridge/keychain**: Removed feature flag for signers functionality, making multi-signer support generally available (#1961)

### 🚀 Improvements  
- **Bundle Size**: Massive bundle size reduction through multiple optimizations:
  - Migrated from `@solana/web3.js` to lightweight `micro-sol-signer` library, reducing Solana-related code by ~450KB (#1951)
  - Removed MetaMask SDK dependency and migrated Ethereum wallets to shared EIP-6963 base class, saving several MB (#1950)
  - Replaced lodash dependency with custom utilities, eliminating unnecessary library weight (#1960)
- **@cartridge/keychain**: Enhanced error parsing with improved test coverage for "Not active" and ENTRYPOINT_NOT_FOUND cases (#1958, #1957)
- **@cartridge/keychain**: Improved nested error handling for better debugging and user experience (#1949)
- **@cartridge/controller**: Removed unreliable original signer checks for more robust signer management (#1952)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed client fee calculation for ERC721 transactions (#1955)
- **@cartridge/keychain**: Temporarily disabled Solana credits purchase due to reliability issues (#1948)

### ⚠️ Breaking Changes
- **StarkNet Dependencies**: Upgraded to StarkNet v8 with updated WalletAccount constructor API. Applications using WalletAccount directly may need to update from argument-based to object-based constructor parameters (#1939)
- **Ethereum Wallet Integration**: Removed MetaMask SDK in favor of EIP-6963 standard wallet detection. Applications relying on MetaMask SDK-specific features may need updates (#1950)
- **Dependencies**: Removed lodash dependency - any direct usage of lodash utilities from this package will need replacement (#1960)

### 📦 Dependencies
- **starknet**: Updated to ^8.1.2 for improved StarkNet integration and compatibility (#1939)
- **@starknet-react/core**: Updated to ^5.0.1 for StarkNet v8 support (#1939)
- **@starknet-react/chains**: Updated to ^5.0.1 for StarkNet v8 support (#1939)
- **@cartridge/ui**: Multiple updates for improved design consistency and functionality (#1959, #1953, #1947, #1945)
- **Dependencies Removed**: 
  - lodash and @types/lodash (replaced with custom utilities)
  - @solana/web3.js and @solana/spl-token (replaced with micro-sol-signer)
  - @metamask/sdk (replaced with EIP-6963 standard)

## [0.10.0-alpha.1] - 2025-08-29

### 🐛 Bug Fixes
- **@cartridge/controller**: Fixed WalletAccount constructor to properly work with starknet.js v8.5.2, ensuring compatibility with the latest StarkNet library version (#1943)

## [0.10.0-alpha.0] - 2025-08-28

### ✨ New Features
- **@cartridge/controller**: Added lazy load option to defer iframe mounting, improving initial page load performance and providing better control over when the controller iframe is loaded (#1934)
- **@cartridge/keychain**: Added fallback redirect option for social login when popup windows don't work, ensuring better compatibility across different browsers and environments (#1929)
- **@cartridge/controller**: Implemented StarkNet wallet switch chain and send transaction functionality, enabling seamless network switching and transaction execution with external wallets (#1927)
- **@cartridge/keychain**: Enabled Braavos wallet integration, expanding wallet compatibility for users (#1925)
- **@cartridge/keychain**: Combined payment method and network selection screens for a more streamlined user experience during transactions (#1920)
- **@cartridge/keychain**: Added claim starterpack UI, providing an intuitive interface for users to claim their starter packages (#1922)

### 🚀 Improvements  
- **@cartridge/keychain**: Enhanced multicall error parsing to extract more meaningful error messages, improving debugging and user experience during transaction failures (#1923)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed social native login/signup issues to ensure proper authentication flow in native applications (#1937)
- **@cartridge/keychain**: Fixed starterpack hook functionality to ensure proper starterpack claiming and management (#1936)
- **@cartridge/keychain**: Fixed social login issues in native apps, improving authentication reliability (#1932)
- **@cartridge/controller**: Fixed issue where user cancellation of manual transactions was not properly propagated, ensuring proper event handling (#1931)
- **@cartridge/controller**: Fixed connection destroyed on navigate issue, preventing connection loss during page navigation (#1926)
- **@cartridge/keychain**: Fixed missing Base network block explorer integration (#1919)
- **@cartridge/controller**: Fixed handling of transaction execution errors after session updates, improving error recovery and user feedback (#1916)

### 📦 Dependencies
- **starknet.js**: Updated to version 8.5.2 for improved StarkNet integration and bug fixes (#1940)
- **@cartridge/ui**: Multiple updates to the UI component library for improved design consistency and functionality (#1938, #1933, #1930, #1921)

## [0.9.3] - 2025-08-13

### ✨ New Features
- **@cartridge/keychain**: Added multichain purchase flow for starterpack, enabling seamless cross-chain purchasing with improved wallet and network selection (#1868)
- **@cartridge/controller**: Enabled switch chain functionality for external wallets, allowing users to change networks when using external wallet connections (#1899)
- **@cartridge/keychain**: Added ERC1155 listing and purchase support for enhanced NFT marketplace functionality (#1873)
- **@cartridge/keychain**: Added remove signer functionality, allowing users to remove additional signers from their accounts (#1874)

### 🚀 Improvements  
- **@cartridge/controller**: Separated controller and sessions queries for improved performance and better data management (#1892)
- **@cartridge/keychain**: Enhanced validation error display to provide clearer feedback to users during transactions and form submissions (#1877)
- **Development**: Added Claude Code configuration for improved development workflow and AI-assisted coding (#1885)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed multi-purchase ERC721 functionality by replacing window.location pattern with useLocation hook and added proper search params handling (#1897)
- **@cartridge/keychain**: Fixed tokens loading forever issue that prevented proper token balance and information display (#1896)
- **@cartridge/keychain**: Fixed ERC721 listing detection to ensure proper marketplace functionality (#1893)
- **@cartridge/keychain**: Fixed purchase page loading issues for better user experience during transactions (#1894)
- **@cartridge/keychain**: Fixed navigation reset functionality to ensure proper routing after transactions (#1880)
- **@cartridge/keychain**: Fixed sign message handling for boolean values to prevent signing errors (#1879)
- **@cartridge/keychain**: Fixed external wallet transaction failures by improving error handling and transaction processing (#1878)
- **@cartridge/keychain**: Fixed parameter updates for better transaction handling (#1888)
- **CI/CD**: Removed non-working end-to-end CI tests to improve build reliability (#1895)

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates to the UI component library for improved design consistency and functionality (#1886, #1882, #1881)

## [0.9.2] - 2025-07-23

### ✨ New Features
- **@cartridge/keychain**: Added popup flow for addOwner functionality, providing a streamlined user experience for adding account signers (#1835)
- **@cartridge/keychain**: Merged profile functionality into keychain, consolidating user profile management, inventory, achievements, and activity tracking into a unified interface (#1837)

### 🚀 Improvements  
- **Development**: Added compatibility Next.js example build to improve development and testing workflows (#1836)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed password manager detection for hidden input fields to prevent interference with browser password managers (#1848)
- **@cartridge/keychain**: Fixed slot routes to ensure proper navigation and routing within the slot funding flow (#1847)
- **@cartridge/controller**: Fixed incorrect update session request handling to improve session management reliability (#1843)
- **@cartridge/keychain**: Fixed Bitwarden integration flow to ensure compatibility with the Bitwarden password manager (#1840)
- **@cartridge/keychain**: Enhanced logging and fixed various issues for better debugging and error tracking (#1839)
- **@cartridge/keychain**: Fixed multiple issues related to owners and session management for improved account functionality (#1834)

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates to the UI component library for improved design consistency and functionality (#1845, #1833, #1832, #1831)

## [0.9.0] - 2025-07-15

### ✨ New Features
- **@cartridge/keychain**: Added slot funding flow for teams, enabling team-based slot funding with comprehensive purchase flow integration (#1815)
- **@cartridge/controller**: Added multi-signer support with the ability to add additional signers to accounts (#1813)
- **@cartridge/keychain**: Added feature gating for add-signer functionality to control access to multi-signer features (#1821)

### 🚀 Improvements  
- **@cartridge/keychain**: Refactored purchase flow with improved component structure and better separation of concerns (#1808)
- **Development**: Removed Claude code review integration to streamline development workflow (#1824)

### 🐛 Bug Fixes
- **@cartridge/keychain**: Fixed slot team selection screen display issues (#1826)
- **@cartridge/keychain**: Improved error messaging for better user experience (#1818)
- **@cartridge/keychain**: Fixed version constraint issue when adding a signer (#1817)

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates to the UI component library for improved design consistency and bug fixes (#1827, #1825, #1823, #1822, #1820, #1819, #1816, #1814, #1811, #1805, #1803)

## [0.8.0] - 2025-06-24

### ✨ New Features
- **Session Management**: Added comprehensive session management functionality enabling secure session handling, registration, and consent flows for improved gaming UX (#1722)
- **Controller Interface Simplification**: Streamlined the main Controller interface with improved defaults and better developer experience (#1759)

### 🚀 Improvements  
- **@cartridge/controller**: Refactored WalletConnect implementation in preparation for multiple signers support (#1780)
- **@cartridge/controller**: Improved chain precedence logic to prioritize cartridgeChains over provided chains (#1769)
- **CI/CD**: Enhanced release automation with GitHub releases creation (#1782) and job summaries (#1784)
- **CI/CD**: Added automated changelog generation workflows (#1786) and simplified release workflow (#1789)
- **Development**: Added Claude Code integration and workflow improvements for better collaboration (#1768, #1766)

### 🐛 Bug Fixes
- **@cartridge/profile**: Fixed decimal formatting for credits balance display (#1781)
- **@cartridge/controller**: Fixed Discord integration bug that occurred when no wallet session exists (#1762)
- **Documentation**: Resolved doc-sync injection issues and improved sync reliability (#1764, #1765)
- **CI/CD**: Fixed changelog generation and multi-line output issues in release workflows (#1788)

### ⚠️ Breaking Changes
- **Controller Interface**: The Controller interface has been simplified, which may require updates to existing integrations. Refer to the updated examples for migration guidance (#1759)
- **Session Management**: Introduction of new session management system may require updates to applications using custom session handling

### 📦 Dependencies
- **@cartridge/ui**: Multiple updates to the UI component library for improved design consistency (#1775, #1776, #1779)
- **Testing**: Enhanced test infrastructure with improved mocking and CI workflows
- **Build**: Updated TypeScript configurations and build processes across the monorepo