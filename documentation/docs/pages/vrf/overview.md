# Overview

This Cartridge Verfiable Random Function (VRF) is designed to provide cheap, atomic verfiable randomness for fully onchain games.

## Key Features

1.  **Atomic Execution**: The VRF request and response are processed within the same transaction, ensuring synchronous and immediate randomness for games.

2.  **Efficient Onchain Verification**: Utilizes the Stark curve and Poseidon hash for optimized verification on Starknet.

3.  **Fully Onchain**: The entire VRF process occurs onchain, maintaining transparency and verifiability.

4.  **Improved Player Experience**: The synchronous nature of the VRF allows for instant resolution of random events in games, enhancing gameplay fluidity.

## How It Works

1.  A game calls `request_random(caller, source)` as the first call in their multicall.
2.  A game contract calls `consume_random(source)` on the VRF contract.
3.  The VRF server generates a random value using the VRF algorithm for the provided entropy source.
4.  The Cartridge Paymaster wraps the players multicall with a `submit_random` and `assert_consumed` call.
5.  The `submit_random` call submit a VRF Proof for the request, the VRF Proof is verified onchain, ensuring the integrity of the random value which is immediately available and must be used within the same transaction.
6.  The `assert_consumed` call ensures that `consume_random(source)` has been called, it also reset the storage used to store the random value during the transaction to 0.

## Benefits for Game Developers

-   **Simplicity**: Easy integration with existing Starknet smart contracts and Dojo.
-   **Performance**: Synchronous randomness generation without waiting for multiple transactions.
-   **Cost-effectiveness**: Potential cost savings through Paymaster integration.
-   **Security**: Cryptographically secure randomness that's fully verifiable onchain.

### Deployments

| Network | Class Hash                                                                                                                                                                    | Contract Address                                                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mainnet | [0x00be3edf412dd5982aa102524c0b8a0bcee584c5a627ed1db6a7c36922047257](https://voyager.online/class/0x00be3edf412dd5982aa102524c0b8a0bcee584c5a627ed1db6a7c36922047257)         | [0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f](https://voyager.online/contract/0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f) |
| Sepolia | [0x00be3edf412dd5982aa102524c0b8a0bcee584c5a627ed1db6a7c36922047257](https://sepolia.voyager.online/class/0x00be3edf412dd5982aa102524c0b8a0bcee584c5a627ed1db6a7c36922047257) | [0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f](https://sepolia.voyager.online/contract/0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f) |

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
    let player_id = get_caller_address();
    let random_value = vrf_provider.consume_random(Source::Nonce(player_id));

    // Use the random value in your game logic
    // ...
}
```

5.  You can use either `Source::Nonce(ContractAddress)` or `Source::Salt(felt252)` as the source for randomness:

    -   `Source::Nonce(ContractAddress)`: Uses the provided contract address internal nonce for randomness. \
    Each request will generate a different seed ensuring unique random values.
   
    -   `Source::Salt(felt252)`: Uses a provided salt value for randomness. \
    Two requests with same salts will result in same random value.

## Executing VRF transactions

In order to execute a transaction that includes a `consume_random` call, you need to include a `request_random` transaction as the first transaction in the multicall. The `request_random` call allows our server to efficiently parse transactions that include a `consume_random` call internally.

```js
const call = await account.execute([
  // Prefix the multicall with the request_random call
  {
    contractAddress: VRF_PROVIDER_ADDRESS,
    entrypoint: 'request_random',
    calldata: CallData.compile({
      caller: GAME_CONTRACT,
      // Using Source::Nonce(address)
      source: {type: 0, address: account.address},
      // Using Source::Salt(felt252)
      // source: {type: 1, salt: 0x123}
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

### Important: Adding VRF to Policies

When using the Cartridge Controller with VRF, make sure to add the VRF contract address and the `request_random` method to your policies. This allows the controller to pre-approve VRF-related transactions, ensuring a seamless experience for your users.

Add the following policy to your existing policies:

```typescript
const policies: Policy[] = [
  // ... your existing policies ...
  {
    target: VRF_PROVIDER_ADDRESS,
    method: "request_random",
    description: "Allows requesting random numbers from the VRF provider",
  },
];
```

This ensures that VRF-related transactions can be executed without requiring additional user approval each time.

By following these steps, you can integrate the VRF Provider into your Starknet contract and generate verifiable random 
numbers for your onchain game or application.

## Security Assumptions

During the Phase 0 deployment, the construction assumes the Provider has not revealed the private key and does not collude with players.

In the future, we plan to move the Provider to a Trusted Execution Environment (TEE) in order to provide a more robust security model without compromising on performance.
