# Changelog

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