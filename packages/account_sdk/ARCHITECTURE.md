# Account SDK Architecture

The Account SDK is a Rust-based package that provides core functionality for managing blockchain accounts, sessions, and transactions on StarkNet. This document outlines the main components and their responsibilities.

## Directory Structure

```
src/
├── account/               # Core account management functionality
│   ├── session/          # Session management and policies
│   ├── outside_execution.rs # External execution handler (v1)
│   ├── outside_execution_v2.rs # Enhanced execution handler
│   ├── outside_execution_v3.rs # Latest execution handler
│   └── macros.rs         # Utility macros for account operations
├── abigen/              # Auto-generated contract bindings
├── controller.rs        # Main controller implementation
├── session.rs          # Session management implementation
├── execute_from_outside.rs # External execution interface
├── storage/            # Data persistence layer
├── provider.rs         # Blockchain provider implementations
├── typed_data.rs       # Type-safe data handling
├── factory.rs          # Factory patterns for object creation
├── signers/            # Transaction signing implementations
├── utils/             # Utility functions and helpers
└── lib.rs             # Library entry point and exports
```

## Core Components

### Account Management
The `account` module is the central component handling account operations:
- Session management with policy enforcement
- Multiple versions of outside execution handlers for backward compatibility
- Account-related macros and utilities
- Implementation of `AccountHashAndCallsSigner` trait for transaction signing
- Call encoding functionality for StarkNet transactions

### Controller
The `controller.rs` module serves as the main orchestrator for account management and transaction execution:

Core Functionality:
- Account Creation and Management
  - Handles account deployment and initialization
  - Manages account state and metadata
  - Supports account delegation and ownership transfer
  - Maintains account nonce management

- Transaction Management
  - Executes transactions with fee estimation
  - Handles message signing and verification
  - Manages transaction nonces
  - Supports typed data signing (EIP-712 style)

- State and Storage
  - Maintains persistent account state
  - Manages controller metadata
  - Handles storage backend interactions
  - Supports cross-session state persistence

- Network Integration
  - Integrates with StarkNet RPC providers
  - Manages chain-specific configurations
  - Handles network-specific error cases
  - Supports fee estimation and gas management

Key Components:
- `Controller` struct:
  - Manages account identity (address, chain_id, class_hash)
  - Handles user authentication (username, owner)
  - Maintains network connectivity (rpc_url, provider)
  - Manages execution state (nonce, execute_from_outside_nonce)

- Implementation Traits:
  - `ConnectedAccount`: Network connectivity
  - `AccountHashAndCallsSigner`: Transaction signing
  - `ExecutionEncoder`: Call encoding
  - Custom error handling via `ControllerError`

### Session Management
Session-related functionality provides a sophisticated policy-based access control system:

Core Features:
- Session Creation and Management
  - Support for time-bound sessions with expiration
  - Guardian-based session security
  - Dynamic session key generation
  - Session metadata persistence

- Policy Management
  - Flexible policy definition system
  - Support for different policy types:
    - Call Policies: Contract-specific function access
    - TypedData Policies: Structured data signing permissions
  - Policy verification and enforcement
  - Merkle proof-based policy validation

- Security Features
  - Session-specific signing keys
  - Authorization chain validation
  - Guardian-based recovery options
  - Time-based access control

Components:
- `Session` struct:
  - Manages session lifecycle
  - Handles session key management
  - Enforces policy constraints
  - Maintains session metadata

- Policy Types:
  - `CallPolicy`: Controls contract interaction
    - Contract address restrictions
    - Function selector limitations
  - `TypedDataPolicy`: Manages structured data signing
    - Scope-based restrictions
    - Type-safe data handling

- Implementation Details:
  - Merkle tree-based policy verification
  - Struct hashing for policy integrity
  - Session authorization chains
  - Cross-platform storage support

### External Execution
The external execution system provides multiple versioned implementations:
- `outside_execution.rs`: Base implementation
- `outside_execution_v2.rs`: Enhanced features
- `outside_execution_v3.rs`: Latest optimizations
- Enables secure cross-chain operations
- Handles external system interactions
- Maintains backward compatibility

### Storage
The `storage` module handles:
- Persistent state management
- Transaction caching
- Key-value storage abstraction
- Cross-platform storage compatibility

### Provider Interface
`provider.rs` implements:
- StarkNet network interaction
- Transaction broadcasting and monitoring
- Contract interaction patterns
- RPC communication handling

### Contract Bindings
The `abigen/` directory contains:
- Auto-generated Rust bindings for smart contracts
- Type-safe contract interaction
- ABI definitions and serialization

### Signing Infrastructure
The `signers/` module provides:
- Multiple signature scheme implementations
- Transaction signing logic
- Key management utilities
- Error handling for signing operations

## Testing Strategy

The codebase maintains a comprehensive test suite:
- Unit tests alongside implementation files
- Dedicated test modules (e.g., `controller_test.rs`, `session_test.rs`)
- Integration tests in the `tests/` directory
- Cross-platform testing support (native and WASM)

## Error Handling

Error management is centralized in `errors.rs`:
- Custom error types for different failure modes
- Error propagation patterns
- Result type definitions
- Specialized error handling for external integrations

## Constants and Configuration

System-wide constants and configurations are managed through:
- `constants.rs`: System-wide constants and configuration
- `artifacts.rs`: Build artifacts and contract deployments
- Environment-specific configurations

## Utilities

Supporting functionality is organized in:
- `utils/`: General-purpose utilities
- `hash.rs`: Cryptographic operations and hashing
- `typed_data.rs`: Type-safe data handling and serialization
- Cairo-specific type handling and conversion

## Upgrade Mechanism

The system supports upgrades through:
- `upgrade.rs`: Upgrade coordination and execution
- `upgrade_test.rs`: Upgrade verification tests
- Version management for backward compatibility
- Safe state migration patterns

## Cross-Platform Support

The SDK supports multiple platforms:
- Native Rust environments
- WebAssembly (WASM) targets
- Platform-specific optimizations
- Conditional compilation for different targets 