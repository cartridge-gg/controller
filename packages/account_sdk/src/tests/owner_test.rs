use crate::{
    abigen::erc_20::Erc20,
    account::session::{create::SessionCreator, hash::AllowedMethod},
    controller::Controller,
    signers::{webauthn::WebauthnSigner, HashSigner, NewOwnerSigner, SignError, SignerTrait},
    storage::InMemoryBackend,
    tests::{account::webauthn::SoftPasskeySigner, ensure_txn, runners::katana::KatanaRunner},
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    accounts::{Account, AccountError},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};
use starknet_crypto::Felt;

use super::account::FEE_TOKEN_ADDRESS;

#[tokio::test]
async fn test_change_owner() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    assert!(controller
        .contract
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    let new_signer = SigningKey::from_random();
    let new_signer_signature = new_signer
        .sign_new_owner(&controller.chain_id(), &controller.address())
        .await
        .unwrap();

    let add_owner = controller
        .contract
        .add_owner_getcall(&new_signer.signer(), &new_signer_signature);
    let remove_owner = controller.contract.remove_owner_getcall(&signer.signer());

    ensure_txn(
        controller.execute_v1(vec![add_owner, remove_owner]),
        runner.client(),
    )
    .await
    .unwrap();

    assert!(!controller
        .contract
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    assert!(controller
        .contract
        .is_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());
}

#[tokio::test]
async fn test_add_owner() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    assert!(controller
        .contract
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());
    let new_signer = SigningKey::from_random();
    let new_signer_signature = new_signer
        .sign_new_owner(&controller.chain_id(), &controller.address())
        .await
        .unwrap();

    ensure_txn(
        controller
            .contract
            .add_owner(&new_signer.signer(), &new_signer_signature),
        runner.client(),
    )
    .await
    .unwrap();

    assert!(controller
        .contract
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());
    assert!(controller
        .contract
        .is_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());

    controller.account.set_signer(new_signer.clone());

    let new_new_signer = SigningKey::from_random();
    let new_signer_signature = new_new_signer
        .sign_new_owner(&controller.chain_id(), &controller.address())
        .await
        .unwrap();

    ensure_txn(
        controller
            .contract
            .add_owner(&new_new_signer.signer(), &new_signer_signature),
        runner.client(),
    )
    .await
    .unwrap();

    assert!(controller
        .contract
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    assert!(controller
        .contract
        .is_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());

    assert!(controller
        .contract
        .is_owner(&new_new_signer.signer().guid())
        .call()
        .await
        .unwrap());
}

#[tokio::test]
#[should_panic]
async fn test_change_owner_wrong_signature() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    assert!(controller
        .contract
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    let new_signer = SigningKey::from_random();
    let old_guid = signer.signer().guid();

    // We sign the wrong thing thus the owner change should painc
    let new_signer_signature = (&new_signer as &dyn HashSigner)
        .sign(&old_guid)
        .await
        .unwrap();

    controller
        .contract
        .add_owner(&new_signer.signer(), &new_signer_signature)
        .fee_estimate_multiplier(1.5)
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_change_owner_execute_after() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    let new_signer = SigningKey::from_random();
    let new_signer_signature = new_signer
        .sign_new_owner(&controller.chain_id(), &controller.address())
        .await
        .unwrap();

    let add_owner = controller
        .contract
        .add_owner_getcall(&new_signer.signer(), &new_signer_signature);
    let remove_owner = controller.contract.remove_owner_getcall(&signer.signer());

    ensure_txn(
        controller.account.execute_v1(vec![add_owner, remove_owner]),
        runner.client(),
    )
    .await
    .unwrap();

    let recipient = felt!("0x18301129");
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller.account);

    // Old signature should fail
    let result = ensure_txn(
        contract_erc20.transfer(
            &ContractAddress(recipient),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        ),
        runner.client(),
    )
    .await;

    assert!(result.is_err(), "Transaction should have failed");

    controller.account.set_signer(new_signer.clone());

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller.account);

    ensure_txn(
        contract_erc20.transfer(
            &ContractAddress(recipient),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        ),
        runner.client(),
    )
    .await
    .unwrap();
}

#[tokio::test]
async fn test_change_owner_invalidate_old_sessions() {
    let signer = SigningKey::from_random();
    let guardian = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    let transfer_method = AllowedMethod::new(*FEE_TOKEN_ADDRESS, selector!("transfer"));

    let session_account = controller
        .account
        .session_account(
            SigningKey::from_random(),
            vec![transfer_method.clone()],
            u64::MAX,
        )
        .await
        .unwrap();

    let new_signer = SigningKey::from_random();

    let new_signer_signature = new_signer
        .sign_new_owner(&controller.chain_id(), &controller.address())
        .await
        .unwrap();

    let add_owner = controller
        .contract
        .add_owner_getcall(&new_signer.signer(), &new_signer_signature);
    let remove_owner = controller.contract.remove_owner_getcall(&signer.signer());

    ensure_txn(
        controller.account.execute_v1(vec![add_owner, remove_owner]),
        runner.client(),
    )
    .await
    .unwrap();

    let recipient = felt!("0x18301129");
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    // Old session should fail
    let result = ensure_txn(
        contract_erc20.transfer(
            &ContractAddress(recipient),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        ),
        runner.client(),
    )
    .await;

    assert!(result.is_err(), "Transaction should have failed");

    let controller = Controller::new(
        "app_id".to_string(),
        "username".to_owned(),
        runner.client(),
        new_signer.clone(),
        guardian.clone(),
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        InMemoryBackend::default(),
    );

    let session_account = controller
        .account
        .session_account(SigningKey::from_random(), vec![transfer_method], u64::MAX)
        .await
        .unwrap();
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    // New session should work
    ensure_txn(
        contract_erc20.transfer(
            &ContractAddress(recipient),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        ),
        runner.client(),
    )
    .await
    .unwrap();
}

#[tokio::test]
async fn test_call_unallowed_methods() {
    let signer = WebauthnSigner::register(
        "cartridge.gg".to_string(),
        "username".to_string(),
        "challenge".as_bytes(),
        SoftPasskeySigner::new("https://cartridge.gg".try_into().unwrap()),
    )
    .await
    .unwrap();

    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    // Create random allowed method
    let transfer_method = AllowedMethod::new(*FEE_TOKEN_ADDRESS, selector!("transfer"));

    let session_account = controller
        .account
        .session_account(
            SigningKey::from_random(),
            vec![transfer_method.clone()],
            u64::MAX,
        )
        .await
        .unwrap();

    let contract = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    let address = ContractAddress(controller.address());
    let amount = U256 {
        high: 0,
        low: 0x10_u128,
    };

    // calling allowed method should succeed
    assert!(contract
        .transfer(&address, &amount)
        .fee_estimate_multiplier(1.5)
        .send()
        .await
        .is_ok());

    // Perform contract invocation that is not part of the allowed methods
    let error = contract
        .approve(&address, &amount)
        .fee_estimate_multiplier(1.5)
        .send()
        .await
        .unwrap_err();

    // calling unallowed method should fail with `SessionMethodNotAllowed` error
    let e @ AccountError::Signing(SignError::SessionMethodNotAllowed {
        selector,
        contract_address,
    }) = error
    else {
        panic!("Expected `SessionMethodNotAllowed` error, got: {error:?}")
    };

    assert_eq!(selector!("approve"), selector);
    assert_eq!(contract.address, contract_address);
    assert!(e.to_string().contains("Not allowed to call method"));
}

#[tokio::test]
async fn test_external_owner() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let delegate_address = Felt::from_hex("0x1234").unwrap();
    let external_account = runner.executor().await;

    let controller = runner
        .deploy_controller("username".to_owned(), &signer)
        .await;

    let external_controller =
        crate::abigen::controller::Controller::new(controller.address(), &external_account);

    // register_external_owner
    ensure_txn(
        controller
            .contract
            .register_external_owner(&external_account.address().into()),
        runner.client(),
    )
    .await
    .unwrap();

    // external owner set_delegate_account
    ensure_txn(
        external_controller.set_delegate_account(&delegate_address.into()),
        runner.client(),
    )
    .await
    .unwrap();

    let delegate_account = controller.delegate_account().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr == delegate_address),
        "should be delegate_address"
    );
}
