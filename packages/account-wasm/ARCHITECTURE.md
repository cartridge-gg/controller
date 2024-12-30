# Account WASM Package Architecture

This document outlines the architecture and code organization of the Account WASM package, which provides WebAssembly bindings for Starknet account management and session handling.

## Overview

The Account WASM package serves as a bridge between JavaScript/TypeScript applications and the Starknet blockchain, providing account management, session handling, and transaction execution capabilities. It wraps the core Rust-based account SDK functionality in WebAssembly bindings for browser compatibility.

## Directory Structure

```
packages/account-wasm/
├── src/                    # Source code directory
├── pkg-session/           # Session-related WebAssembly output
├── pkg-controller/        # Controller-related WebAssembly output
├── Cargo.toml             # Rust dependencies and package configuration
├── package.json           # NPM package configuration
├── build.sh              # WebAssembly build script
└── tsconfig.json         # TypeScript configuration
```

## Core Components

### 1. CartridgeAccount (`src/account.rs`)
The main account management interface that provides:
- Account creation and initialization
- Session management (registration, creation, revocation)
- Transaction execution and fee estimation
- Message signing and verification
- Account deployment and delegation

Key features:
- Session-based transaction authorization
- External execution support
- Account metadata management
- Nonce management
- Message signing capabilities

### 2. Session Management (`src/session.rs`)
Handles session-related functionality:
- Session account creation and initialization
- Transaction signing within sessions
- Outside execution support for session-based transactions
- Session authorization and validation

### 3. Type Definitions and Utilities
- Custom type definitions for cross-language compatibility
- Error handling and conversion between Rust and JavaScript
- WebAssembly-specific utilities and bindings

## Key Concepts

### Session-Based Authorization
The package implements a session-based authorization system that allows:
- Creation of time-limited sessions
- Policy-based transaction authorization
- Secure transaction execution within session boundaries
- Session revocation and management

### Account Abstraction
The package supports Starknet's account abstraction features:
- Custom account implementation
- Flexible signing schemes
- Transaction validation and execution
- Account upgradability

### WebAssembly Integration
- Rust code is compiled to WebAssembly for browser compatibility
- Provides JavaScript/TypeScript bindings for all core functionality
- Maintains type safety across language boundaries

## Integration Points

### JavaScript/TypeScript Integration
- WebAssembly exports provide a clean API for JavaScript/TypeScript applications
- Type definitions ensure type safety
- Async/await support for blockchain operations

### Starknet Integration
- RPC communication with Starknet nodes
- Transaction construction and signing
- Account deployment and management
- Fee estimation and management

## Security Considerations

The architecture implements several security measures:
- Session-based access control
- Secure key management
- Policy-based transaction authorization
- Time-limited session validity
- Secure message signing

## Build System

The package uses:
- `wasm-bindgen` for WebAssembly binding generation
- Custom build script (`build.sh`) for WebAssembly compilation
- NPM for package management and distribution
- Cargo for Rust dependency management 