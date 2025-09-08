# Changelog

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