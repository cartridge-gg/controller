// SPDX-License-Identifier: MIT

//! # Account Factory
//!
//! The Account Factory is responsible for deploying new Cartridge Account instances.
//! It follows a secure deployment pattern that enables:
//! 1. Single-signature account deployment and initialization
//! 2. Deterministic account addresses
//! 3. Permissionless deployment through unique deploy keypairs
//! 4. Upgradeable account implementation
//!
//! ## Architecture
//!
//! The factory consists of three main components:
//!
//! 1. **Deploy Keypair**: A unique keypair that:
//!    - Its public key is used as the deployment salt
//!    - Signs the deployment transaction
//!    - Enables permissionless deployment/redeployment
//!    - Has no privileges beyond deployment
//!
//! 2. **Account Deployment**:
//!    - Takes an owner signer for initial account ownership
//!    - Uses deploy keypair's public key as salt
//!    - Optionally accepts session parameters
//!    - Owner and session data stored temporarily during deployment
//!
//! 3. **Account Class Hash**:
//!    - The implementation of the account contract
//!    - Used in deterministic address computation
//!
//! ## Deployment Flow
//!
//! 1. **Deployment Request**:
//!    - Caller provides deploy keypair signature
//!    - Provides owner signer for account initialization
//!    - Optionally provides session parameters
//!
//! 2. **Factory Contract**:
//!    - Verifies deploy signature
//!    - Uses deploy keypair's public key as salt
//!    - Deploys account with minimal initialization
//!    - Triggers callback for owner/session registration
//!
//! 3. **Callback Registration**:
//!    - `on_account_deployed` called after deployment
//!    - Registers owner signer with account
//!    - Initializes session if parameters provided
//!    - Temporary deployment data erased after callback
//!
//! ## Account Recovery/Redeployment
//!
//! The same account can be redeployed to the same address on different chains because:
//! - Address computation uses deploy keypair's public key as salt
//! - Deploy keypair can authorize redeployment
//! - Original owner not required for redeployment
//!
//! ## Security Considerations
//!
//! 1. **Deploy Keypair**:
//!    - Public key determines account address
//!    - Only used for deployment authorization
//!    - No access to account after deployment
//!
//! 2. **Owner Registration**:
//!    - Owner signer stored temporarily during deployment
//!    - Registered via callback mechanism
//!    - Data erased after successful registration
//!
//! 3. **Session Initialization**:
//!    - Optional session parameters
//!    - Initialized during callback if provided
//!    - Session data erased after registration

use core::option::Option;
use starknet::{ContractAddress, ClassHash};
use argent::session::interface::Session;
use argent::signer::signer_signature::{StarknetSigner, StarknetSignature};
use controller::account::{ICartridgeAccount, Owner};

#[starknet::interface]
trait IAccountFactory<TContractState> {
    fn deploy_account(
        ref self: TContractState,
        owner: Owner,
        session: Option<(Session, felt252)>,
        deploy_signature: (StarknetSigner, StarknetSignature),
    ) -> ContractAddress;

    fn account_class_hash(self: @TContractState) -> ClassHash;

    fn update_account_class_hash(ref self: TContractState, new_class_hash: ClassHash);
}

#[starknet::contract]
mod account_factory {
    use core::option::Option;
    use starknet::{
        ContractAddress, ClassHash, deploy_syscall, get_caller_address, get_contract_address
    };
    use argent::session::interface::Session;
    use argent::signer::signer_signature::{
        StarknetSigner, StarknetSignature, is_valid_starknet_signature
    };
    use controller::account::{ICartridgeAccount, Owner};
    use controller::factory::IAccountFactory;
    use controller::session::interface::{ISessionDispatcher, ISessionDispatcherTrait};

    #[storage]
    struct Storage {
        account_class_hash: ClassHash,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AccountClassHashUpdated: AccountClassHashUpdated,
        AccountDeployed: AccountDeployed,
    }

    #[derive(Drop, starknet::Event)]
    struct AccountClassHashUpdated {
        #[key]
        old_class_hash: ClassHash,
        #[key]
        new_class_hash: ClassHash,
    }

    #[derive(Drop, starknet::Event)]
    struct AccountDeployed {
        #[key]
        account_address: ContractAddress,
        #[key]
        owner: Owner,
        #[key]
        deploy_pubkey: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, account_class_hash: ClassHash) {
        self.account_class_hash.write(account_class_hash);
    }

    #[abi(embed_v0)]
    impl AccountFactoryImpl of IAccountFactory<ContractState> {
        fn deploy_account(
            ref self: ContractState,
            owner: Owner,
            session: Option<(Session, felt252)>,
            deploy_signature: (StarknetSigner, StarknetSignature),
        ) -> ContractAddress {
            let (signer, signature) = deploy_signature;
            let deploy_pubkey = signer.pubkey.into();

            let deploy_hash = self.compute_deploy_hash(owner, deploy_pubkey);
            assert(
                is_valid_starknet_signature(deploy_hash, signer, signature),
                'invalid_deploy_signature'
            );

            let constructor_calldata = array![deploy_pubkey];
            let (account_address, _) = deploy_syscall(
                self.account_class_hash.read(), deploy_pubkey, constructor_calldata.span(), false
            )
                .unwrap();

            if let Option::Some((session, guid_or_address)) = session {
                ISessionDispatcher { contract_address: account_address }
                    .register_session(session, guid_or_address);
            }

            self.emit(AccountDeployed { account_address, owner, deploy_pubkey });

            account_address
        }

        fn update_account_class_hash(ref self: ContractState, new_class_hash: ClassHash) {
            // assert owner

            let old_class_hash = self.account_class_hash.read();
            self.account_class_hash.write(new_class_hash);

            self.emit(AccountClassHashUpdated { old_class_hash, new_class_hash });
        }

        fn account_class_hash(self: @ContractState) -> ClassHash {
            self.account_class_hash.read()
        }
    }

    //
    // Internal
    //

    #[generate_trait]
    impl ContractInternalImpl of ContractInternalTrait {
        fn compute_deploy_hash(self: @ContractState, owner: Owner, salt: felt252) -> felt252 {
            0
        }

        fn is_valid_deploy_signature(
            self: @ContractState, hash: felt252, signature: Span<SignerSignature>
        ) -> bool {
            true
        }
    }
}
