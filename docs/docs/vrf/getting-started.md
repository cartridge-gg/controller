# Getting started

## Using the VRF Provider

To integrate the Verifiable Random Function (VRF) into your Starknet contract, follow these steps:

1.  Import the VRF Provider interface:

```
use cartridge_vrf::vrf_provider::IVrfProviderDispatcher;
use cartridge_vrf::vrf_provider::IVrfProviderDispatcherTrait;
use cartridge_vrf::vrf_provider::Source;
```

2.  Define the VRF Provider address in your contract:

```
const VRF_PROVIDER_ADDRESS: starknet::ContractAddress = starknet::contract_address_const::<0x123>();
```

3.  Create a dispatcher for the VRF Provider:

```
let vrf_provider = IVrfProviderDispatcher { contract_address: VRF_PROVIDER_ADDRESS };
```

4.  To consume random values, use the following pattern in your contract functions:

```
#[external]
fn my_function(ref self: ContractState) {
    // Your game logic here...

    // Consume random value
    let random_value = vrf_provider.consume_random(Source::Nonce(get_contract_address()));

    // Use the random value in your game logic
    // ...

}
```

5.  You can use either `Source::Nonce(ContractAddress)` or `Source::Salt(felt252)` as the source for randomness:

    -   `Source::Nonce(ContractAddress)`: Uses the contract's address and an internal nonce for randomness.
    -   `Source::Salt(felt252)`: Uses a provided salt value for randomness.

6.  Ensure that you call `consume_random` with the same `Source` as used in `request_random`.

By following these steps, you can integrate the VRF Provider into your Starknet contract and generate verifiable random numbers for your onchain game or application.
