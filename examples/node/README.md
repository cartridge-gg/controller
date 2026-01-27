# Cartridge Node.js Session Example

This example demonstrates how to use the Cartridge session controller with Node.js

## Setup

1.  Install dependencies:

```bash
npm install
```

2.  Run the example:

```bash
npm start
```

## Simple example

Run a minimal session registration + execute flow:

```bash
node --experimental-wasm-modules --import tsx src/session.ts
```

This prints a URL to authorize the session in your browser, then executes a
simple transfer after the session is created.

## What's happening?

The example demonstrates:
1. Setting up a filesystem backend for session storage
2. Creating a session controller instance
3. Creating a new session with specific policies
4. Executing a transaction using the session

## Customization

To use this example with your own contract:

1.  Replace the contract address (`0x123...`) with your actual contract address
2.  Modify the policies to match your contract's methods
3.  Update the transaction parameters in the `execute` call to match your use case
