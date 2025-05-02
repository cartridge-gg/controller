use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{
        AccountDeploymentV1, AccountFactory, PreparedAccountDeploymentV1,
        PreparedAccountDeploymentV3, RawAccountDeploymentV1, RawAccountDeploymentV3,
    },
    core::{
        crypto::compute_hash_on_elements,
        types::{BlockId, BlockTag, Felt},
    },
};
use starknet_types_core::felt::NonZeroFelt;

use crate::{
    abigen::controller::SignerSignature,
    provider::CartridgeJsonRpcProvider,
    signers::{HashSigner, Owner, SignError},
};

#[derive(Clone)]
pub struct ControllerFactory {
    class_hash: Felt,
    chain_id: Felt,
    owner: Owner,
    provider: CartridgeJsonRpcProvider,
    block_id: BlockId,
}

impl ControllerFactory {
    pub fn new(
        class_hash: Felt,
        chain_id: Felt,
        owner: Owner,
        provider: CartridgeJsonRpcProvider,
    ) -> Self {
        Self {
            class_hash,
            chain_id,
            owner,
            provider,
            block_id: BlockId::Tag(BlockTag::Pending),
        }
    }

    pub fn address(&self, salt: Felt) -> Felt {
        self.deploy_v3(salt).address()
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl AccountFactory for ControllerFactory {
    type Provider = CartridgeJsonRpcProvider;
    type SignError = SignError;

    fn class_hash(&self) -> Felt {
        self.class_hash
    }

    fn calldata(&self) -> Vec<Felt> {
        let mut calldata =
            crate::abigen::controller::Owner::cairo_serialize(&self.owner.clone().into());
        calldata.push(Felt::ONE); // no guardian
        calldata
    }

    fn chain_id(&self) -> Felt {
        self.chain_id
    }

    fn is_signer_interactive(&self) -> bool {
        true
    }

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }

    async fn sign_deployment_v1(
        &self,
        deployment: &RawAccountDeploymentV1,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = PreparedAccountDeploymentV1::from_raw(deployment.clone(), self)
            .transaction_hash(query_only);
        let signature = self.owner.sign(&tx_hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
    }

    async fn sign_deployment_v3(
        &self,
        deployment: &RawAccountDeploymentV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = PreparedAccountDeploymentV3::from_raw(deployment.clone(), self)
            .transaction_hash(query_only);
        let signature = self.owner.sign(&tx_hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
    }

    fn deploy_v1(&self, salt: Felt) -> AccountDeploymentV1<'_, Self> {
        AccountDeploymentV1::new(salt, self)
    }
}

/// Computes the Starknet contract address for a controller account.
///
/// # Arguments
///
/// * `class_hash` - The class hash of the account contract.
/// * `owner` - The owner configuration for the account.
/// * `salt` - The salt used for address calculation.
///
/// # Returns
///
/// The computed Starknet contract address as a `Felt`.
pub fn compute_account_address(class_hash: Felt, owner: Owner, salt: Felt) -> Felt {
    let mut constructor_calldata = crate::abigen::controller::Owner::cairo_serialize(&owner.into());
    constructor_calldata.push(Felt::ONE); // no guardian

    calculate_contract_address(salt, class_hash, &constructor_calldata)
}

// https://github.com/xJonathanLEI/starknet-rs/blob/a70f4cef2032ea0ea839d615426e42a74993bf0b/starknet-accounts/src/factory/mod.rs#L37
/// Cairo string for `STARKNET_CONTRACT_ADDRESS`
const PREFIX_CONTRACT_ADDRESS: Felt = Felt::from_raw([
    533439743893157637,
    8635008616843941496,
    17289941567720117366,
    3829237882463328880,
]);

// 2 ** 251 - 256
const ADDR_BOUND: NonZeroFelt = NonZeroFelt::from_raw([
    576459263475590224,
    18446744073709255680,
    160989183,
    18446743986131443745,
]);

fn calculate_contract_address(salt: Felt, class_hash: Felt, constructor_calldata: &[Felt]) -> Felt {
    compute_hash_on_elements(&[
        PREFIX_CONTRACT_ADDRESS,
        Felt::ZERO,
        salt,
        class_hash,
        compute_hash_on_elements(constructor_calldata),
    ])
    .mod_floor(&ADDR_BOUND)
}
