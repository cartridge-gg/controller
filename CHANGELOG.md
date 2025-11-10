# Changelog

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