
#[starknet::contract]
mod Resolver {
    use core::option::OptionTrait;
    use core::traits::TryInto;
    use core::array::SpanTrait;
    use starknet::{ContractAddress, get_block_timestamp, storage::Map};
    use ecdsa::check_ecdsa_signature;
    use resolver::interface::{IResolver, IResolverDispatcher, IResolverDispatcherTrait};
    use storage_read::{main::storage_read_component, interface::IStorageRead};
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: storage_read_component, storage: api_url, event: StorageReadEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl StorageReadImpl = storage_read_component::StorageRead<ContractState>;
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        public_key: felt252,
        uri: Map<(felt252, felt252), felt252>,
        #[substorage(v0)]
        api_url: storage_read_component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        StarknetIDOffChainResolverUpdate: StarknetIDOffChainResolverUpdate,
        #[flat]
        StorageReadEvent: storage_read_component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct StarknetIDOffChainResolverUpdate {
        uri_added: Span<felt252>,
        uri_removed: Span<felt252>,
    }


    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, public_key: felt252) {
        self.ownable.initializer(owner);
        self.public_key.write(public_key);
    }

    #[abi(embed_v0)]
    impl ResolverImpl of IResolver<ContractState> {
        fn resolve(
            self: @ContractState, domain: Span<felt252>, field: felt252, hint: Span<felt252>
        ) -> felt252 {
            if hint.len() != 4 {
                panic(self.get_error_array(array!['offchain_resolving'], domain));
            }

            let max_validity = *hint.at(3);
            assert(get_block_timestamp() < max_validity.try_into().unwrap(), 'Signature expired');

            let hashed_domain = self.hash_domain(domain);
            let message_hash: felt252 = hash::LegacyHash::hash(
                hash::LegacyHash::hash(
                    hash::LegacyHash::hash(
                        hash::LegacyHash::hash('ccip_demo resolving', max_validity), hashed_domain
                    ),
                    field
                ),
                *hint.at(0)
            );

            let public_key = self.public_key.read();
            let is_valid = check_ecdsa_signature(
                message_hash, public_key, *hint.at(1), *hint.at(2)
            );
            assert(is_valid, 'Invalid signature');

            return *hint.at(0);
        }

        fn get_uris(self: @ContractState) -> Array<felt252> {
            let mut res: Array<felt252> = array![];
            let mut i: felt252 = 0;
            loop {
                if self.uri.read((i, 0)) == 0 {
                    break;
                }
                if self.uri.read((i, 0)) != 'this call was removed' {
                    // we get the next uri at index i
                    let mut new_uri = self.get_uri_at_index(i);
                    res.append(new_uri.len().into());
                    loop {
                        match new_uri.pop_front() {
                            Option::Some(value) => { res.append(value); },
                            Option::None => { break; }
                        }
                    };
                }
                i += 1;
            };
            res
        }

        fn add_uri(ref self: ContractState, new_uri: Span<felt252>) {
            self.ownable.assert_only_owner();
            let mut i: felt252 = 0;
            loop {
                if self.uri.read((i, 0)) == 0 {
                    self
                        .emit(
                            StarknetIDOffChainResolverUpdate {
                                uri_added: new_uri, uri_removed: array![].span()
                            }
                        );
                    self.store_uri(new_uri, i);

                    break;
                }
                i += 1;
            };
        }

        fn remove_uri(ref self: ContractState, index: felt252) {
            self.ownable.assert_only_owner();
            let uri_removed = self.get_uri_at_index(index).span();
            self.emit(StarknetIDOffChainResolverUpdate { uri_added: array![].span(), uri_removed });
            self.uri.write((index, 0), 'this call was removed');
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn get_uri_at_index(self: @ContractState, index: felt252) -> Array<felt252> {
            let mut res = array![];
            let mut j: felt252 = 0;
            loop {
                let value = self.uri.read((index, j));
                if value == 0 {
                    break;
                }
                res.append(value);
                j += 1;
            };
            res
        }

        fn store_uri(ref self: ContractState, mut uri: Span<felt252>, index: felt252) {
            let mut j = 0;
            loop {
                match uri.pop_front() {
                    Option::Some(value) => {
                        self.uri.write((index, j), *value);
                        j += 1;
                    },
                    Option::None => { break; }
                }
            };
        }

        fn get_error_array(
            self: @ContractState, mut res: Array<felt252>, mut domain: Span<felt252>
        ) -> Array<felt252> {
            // append domain to error array
            res.append(domain.len().into());
            loop {
                match domain.pop_front() {
                    Option::Some(value) => { res.append(*value); },
                    Option::None => { break; }
                }
            };
            // append uris to error array
            self.append_uris(res)
        }

        fn append_uris(self: @ContractState, mut res: Array<felt252>) -> Array<felt252> {
            let mut i: felt252 = 0;
            loop {
                if self.uri.read((i, 0)) == 0 {
                    break;
                }
                if self.uri.read((i, 0)) != 'this call was removed' {
                    // we get the next uri at index i
                    let mut new_uri = self.get_uri_at_index(i);
                    res.append(new_uri.len().into());
                    loop {
                        match new_uri.pop_front() {
                            Option::Some(value) => { res.append(value); },
                            Option::None => { break; }
                        }
                    };
                }
                i += 1;
            };
            res
        }

        fn hash_domain(self: @ContractState, domain: Span<felt252>) -> felt252 {
            if domain.len() == 0 {
                return 0;
            };
            let new_len = domain.len() - 1;
            let x = *domain[new_len];
            let y = self.hash_domain(domain.slice(0, new_len));
            let hashed_domain = pedersen::pedersen(x, y);
            return hashed_domain;
        }
    }
}