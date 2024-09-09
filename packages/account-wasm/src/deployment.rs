use account_sdk::abigen::controller::{self, Signer as AbigenSigner};
use account_sdk::account::session::hash::{AllowedMethod, Session};
use account_sdk::account::session::raw_session::RawSession;
use account_sdk::constants::{ACCOUNT_CLASS_HASH, ETH_CONTRACT_ADDRESS, UDC_ADDRESS};
use account_sdk::signers::HashSigner;
use cainome::cairo_serde::CairoSerde;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use serde_with::serde_as;
use starknet::{
    core::utils::{get_udc_deployed_address, UdcUniqueness},
    signers::SigningKey,
};
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet_types_core::felt::Felt;
use wasm_bindgen::JsValue;

use crate::types::call::JsCall;
use crate::Result;

#[serde_as]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsDeployment {
    #[serde_as(as = "UfeHex")]
    pub address: Felt,
    pub calls: Vec<JsCall>,
    pub session_key: Felt,
}


pub struct JsDeploymentBuilder {
    owner: Felt,
    username: Felt,
    delegate: Felt,
    allowed_methods: Vec<AllowedMethod>,
    expires_at: u64,
    initial_deposit: u64,
}

impl JsDeploymentBuilder {
    pub fn new(owner: Felt, username: Felt) -> Self {
        Self {
            owner,
            username,
            delegate: Felt::ZERO,
            allowed_methods: Vec::new(),
            expires_at: 0,
            initial_deposit: 0,
        }
    }

    pub fn with_allowed_methods(mut self, methods: Vec<AllowedMethod>, expires_at: u64) -> Self {
        self.allowed_methods = methods;
        self.expires_at = expires_at;
        self
    }

    pub fn with_initial_deposit(mut self, initial_deposit: u64) -> Self {
        self.initial_deposit = initial_deposit;
        self
    }

    pub fn with_delegate_account(mut self, delegate: Felt) -> Self {
        self.delegate = delegate;
        self
    }

    pub fn build(self) -> Result<JsValue> {
        let constructor_calldata = Self::create_constructor_calldata(self.owner);
        let address = get_udc_deployed_address(
            self.username,
            ACCOUNT_CLASS_HASH,
            &UdcUniqueness::NotUnique,
            &constructor_calldata,
        );
        let session_signer = SigningKey::from_random();

        let mut js_calls = vec![
            Self::create_udc_deploy_call(self.username, &constructor_calldata),
            Self::create_register_session_call(
                address,
                self.owner,
                self.allowed_methods,
                self.expires_at,
                &session_signer,
            )?,
        ];

        if self.initial_deposit > 0 {
            js_calls.extend(Self::create_initial_deposit_calls(
                address,
                self.initial_deposit,
            ));
        }

        if self.delegate != Felt::ZERO {
            js_calls.push(Self::create_set_delegate_call(address, self.owner));
        }

        let deployment = JsDeployment {
            address,
            calls: js_calls,
            session_key: session_signer.secret_scalar(),
        };

        Ok(to_value(&deployment)?)
    }

    fn create_constructor_calldata(owner: Felt) -> Vec<Felt> {
        let mut calldata =
            controller::Owner::cairo_serialize(&controller::Owner::Account(owner.into()));
        calldata.extend(Option::<AbigenSigner>::cairo_serialize(&None));
        calldata
    }

    fn create_register_session_call(
        address: Felt,
        owner: Felt,
        methods: Vec<AllowedMethod>,
        expires_at: u64,
        session_signer: &SigningKey,
    ) -> Result<JsCall> {
        let session = Session::new(methods, expires_at, &session_signer.signer())?;

        Ok(JsCall {
            contract_address: address,
            entrypoint: "register_session".to_string(),
            calldata: [
                <RawSession as CairoSerde>::cairo_serialize(&session.raw()),
                vec![owner],
            ]
            .concat(),
        })
    }

    fn create_udc_deploy_call(salt: Felt, constructor_calldata: &[Felt]) -> JsCall {
        let mut calldata = vec![
            ACCOUNT_CLASS_HASH,
            salt,
            Felt::ZERO, // unique false
            Felt::from(constructor_calldata.len()),
        ];
        calldata.extend_from_slice(constructor_calldata);

        JsCall {
            contract_address: UDC_ADDRESS,
            entrypoint: "deployContract".to_string(),
            calldata,
        }
    }

    fn create_set_delegate_call(address: Felt, delegate: Felt) -> JsCall {
        JsCall {
            contract_address: address,
            entrypoint: "set_delegate_account".to_string(),
            calldata: vec![delegate],
        }
    }

    fn create_initial_deposit_calls(address: Felt, initial_deposit: u64) -> Vec<JsCall> {
        vec![
            JsCall {
                contract_address: ETH_CONTRACT_ADDRESS,
                entrypoint: "approve".to_string(),
                calldata: vec![address, initial_deposit.into(), Felt::ZERO],
            },
            JsCall {
                contract_address: ETH_CONTRACT_ADDRESS,
                entrypoint: "transfer".to_string(),
                calldata: vec![address, initial_deposit.into(), Felt::ZERO],
            },
        ]
    }
}
