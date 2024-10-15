# Overview

This Cartridge Verfiable Random Function (VRF) is designed to provide cheap, atomic verfiable randomness for fully onchain games.

## Key Features

1. **Atomic Execution**: The VRF request and response are processed within the same transaction, ensuring synchronous and immediate randomness for games.

2. **Efficient Onchain Verification**: Utilizes the Stark curve and Poseidon hash for optimized verification on Starknet.

3. **Fully Onchain**: The entire VRF process occurs onchain, maintaining transparency and verifiability.

4. **Improved Player Experience**: The synchronous nature of the VRF allows for instant resolution of random events in games, enhancing gameplay fluidity.

## How It Works

1. A game calls `request_random(caller, source)` as the first call in their multicall.
2. A game contract calls `consume_random(source)` from the VRF contract.
3. The VRF server generates a random value using the VRF algorithm for the provided entropy source.
4. The Cartridge Paymaster wraps the players multicall with a `submit_random` and `assert_consumed` call.
5. The random value is immediately available and can be used within the same transaction.
6. The VRF proof is verified onchain, ensuring the integrity of the random value.

## Benefits for Game Developers

- **Simplicity**: Easy integration with existing Starknet smart contracts.
- **Performance**: Synchronous randomness generation without waiting for multiple transactions.
- **Cost-effectiveness**: Potential cost savings through Paymaster integration.
- **Security**: Cryptographically secure randomness that's fully verifiable onchain.

For detailed implementation and usage, refer to the [GitHub repository](https://github.com/cartridge-gg/vrf).

## Using the VRF Provider

To integrate the Verifiable Random Function (VRF) into your Starknet contract, follow these steps:

1.  Import the VRF Provider interface:

```rust
use cartridge_vrf::IVrfProviderDispatcher;
use cartridge_vrf::IVrfProviderDispatcherTrait;
use cartridge_vrf::Source;
```

2.  Define the VRF Provider address in your contract:

```rust
const VRF_PROVIDER_ADDRESS: starknet::ContractAddress = starknet::contract_address_const::<0x123>();
```

3.  Create a dispatcher for the VRF Provider:

```rust
let vrf_provider = IVrfProviderDispatcher { contract_address: VRF_PROVIDER_ADDRESS };
```

4.  To consume random values, use the following pattern in your contract functions:

```rust
fn roll_dice(ref self: ContractState) {
    // Your game logic here...

    // Consume random value
    let random_value = vrf_provider.consume_random(Source::Salt('SALT'));

    // Use the random value in your game logic
    // ...
}
```

5.  You can use either `Source::Nonce(ContractAddress)` or `Source::Salt(felt252)` as the source for randomness:

    -   `Source::Nonce(ContractAddress)`: Uses the contract's address and an internal nonce for randomness.
    -   `Source::Salt(felt252)`: Uses a provided salt value for randomness.

## Executing VRF transactions

In order to execute a transaction that includes a `consume_random` call, you need to include a `request_random` transaction as the first transaction in the multicall. The `request_random` call allows our server to efficiently parse transactions that include a `consume_random` call internally.

```js
const call = await account.execute([
  // Prefix the multicall with the 
  {
    contractAddress: VRF_PROVIDER_ADDRESS,
    entrypoint: 'request_random',
    calldata: CallData.compile({
      caller: GAME_CONTRACT,
      // User provided Salt
      source: [1, SALT],
    }),
  },
  {
    contractAddress: GAME_CONTRACT,
    entrypoint: 'roll_dice',
    ...
  },
]);
```

**Ensure that you call `consume_random` with the same `Source` as used in `request_random`.**

By following these steps, you can integrate the VRF Provider into your Starknet contract and generate verifiable random numbers for your onchain game or application.
