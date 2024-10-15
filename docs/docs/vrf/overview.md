# Overview

This Cartridge Verfiable Random Function (VRF) is designed to provide cheap, atomic verfiable randomness for fully onchain games.

## Key Features

1. **Atomic Execution**: The VRF request and response are processed within the same transaction, ensuring synchronous and immediate randomness for games.

2. **Efficient Onchain Verification**: Utilizes the Stark curve and Poseidon hash for optimized verification on Starknet.

3. **Fully Onchain**: The entire VRF process occurs onchain, maintaining transparency and verifiability.

4. **Improved Player Experience**: The synchronous nature of the VRF allows for instant resolution of random events in games, enhancing gameplay fluidity.

## How It Works

1. A game contract requests randomness from the VRF contract.
2. The Cartridge Paymaster wraps this request in a transaction.
3. The VRF server generates a random value using the VRF algorithm.
4. The random value is immediately submitted and can be used within the same transaction.
5. The VRF proof is verified onchain, ensuring the integrity of the random value.

## Benefits for Game Developers

- **Simplicity**: Easy integration with existing Starknet smart contracts.
- **Performance**: Synchronous randomness generation without waiting for multiple transactions.
- **Cost-effectiveness**: Potential cost savings through Paymaster integration.
- **Security**: Cryptographically secure randomness that's fully verifiable onchain.

For detailed implementation and usage, refer to the [GitHub repository](https://github.com/cartridge-gg/vrf).
