use crate::{
    abigen::{controller::Controller, erc_20::Erc20},
    account::{
        session::{create::SessionCreator, hash::AllowedMethod},
        CartridgeAccount,
    },
    signers::{HashSigner, NewOwnerSigner, SignError, SignerTrait},
    tests::{account::signers::InternalWebauthnSigner, runners::katana::KatanaRunner},
    transaction_waiter::TransactionWaiter,
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
    let account = runner.deploy_controller(&signer).await;
    let controller = Controller::new(account.address, account.clone());

    assert!(controller
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    let new_signer = SigningKey::from_random();
    let new_signer_signature = new_signer
        .sign_new_owner(&account.chain_id, &account.address)
        .await
        .unwrap();

    let add_owner = controller.add_owner_getcall(&new_signer.signer(), &new_signer_signature);
    let remove_owner = controller.remove_owner_getcall(&signer.signer());
    let tx = account
        .execute_v1(vec![add_owner, remove_owner])
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    assert!(!controller
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    assert!(controller
        .is_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());
}

#[tokio::test]
async fn test_add_owner() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let mut account = runner.deploy_controller(&signer).await;
    let controller = Controller::new(account.address, account.clone());

    assert!(controller
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());
    let new_signer = SigningKey::from_random();
    let new_signer_signature = new_signer
        .sign_new_owner(&account.chain_id, &account.address)
        .await
        .unwrap();

    let tx = controller
        .add_owner(&new_signer.signer(), &new_signer_signature)
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    assert!(controller
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());
    assert!(controller
        .is_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());

    account.set_signer(new_signer.clone());
    let controller = Controller::new(account.address, account.clone());

    let new_new_signer = SigningKey::from_random();
    let new_signer_signature = new_new_signer
        .sign_new_owner(&account.chain_id, &account.address)
        .await
        .unwrap();

    let tx = controller
        .add_owner(&new_new_signer.signer(), &new_signer_signature)
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    assert!(controller
        .is_owner(&signer.signer().guid())
        .call()
        .await
        .unwrap());

    assert!(controller
        .is_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());

    assert!(controller
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
    let account = runner.deploy_controller(&signer).await;
    let controller = Controller::new(account.address, account.clone());

    assert!(controller
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
        .add_owner(&new_signer.signer(), &new_signer_signature)
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_change_owner_execute_after() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let mut account = runner.deploy_controller(&signer).await;
    let controller = Controller::new(account.address, account.clone());

    let new_signer = SigningKey::from_random();
    let new_signer_signature = new_signer
        .sign_new_owner(&controller.account.chain_id, &controller.account.address)
        .await
        .unwrap();

    let add_owner = controller.add_owner_getcall(&new_signer.signer(), &new_signer_signature);
    let remove_owner = controller.remove_owner_getcall(&signer.signer());

    controller
        .account
        .execute_v1(vec![add_owner, remove_owner])
        .send()
        .await
        .unwrap();

    // Wait for the owner change to be saved on chain
    tokio::time::sleep(std::time::Duration::from_secs(10)).await;

    let new_account = felt!("0x18301129");

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller.account);

    // Old signature should fail
    if contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .is_ok()
    {
        panic!("Should have failed");
    };

    account.set_signer(new_signer.clone());

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &account);

    contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_change_owner_invalidate_old_sessions() {
    let signer = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let guardian = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let account = runner.deploy_controller(&signer).await;

    let transfer_method = AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfer"));

    let session_account = account
        .session_account(
            SigningKey::from_random(),
            vec![transfer_method.clone()],
            u64::MAX,
        )
        .await
        .unwrap();

    let new_signer = SigningKey::from_random();

    let new_signer_signature = new_signer
        .sign_new_owner(&account.chain_id, &account.address)
        .await
        .unwrap();

    let controller = Controller::new(account.address, account.clone());
    let add_owner = controller.add_owner_getcall(&new_signer.signer(), &new_signer_signature);
    let remove_owner = controller.remove_owner_getcall(&signer.signer());

    controller
        .account
        .execute_v1(vec![add_owner, remove_owner])
        .send()
        .await
        .unwrap();

    // Wait for the owner change to be saved on chain
    tokio::time::sleep(std::time::Duration::from_secs(10)).await;

    let new_account = felt!("0x18301129");

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    // Old session should fail
    if contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .is_ok()
    {
        panic!("Should have failed");
    };

    let account = CartridgeAccount::new(
        runner.client(),
        new_signer.clone(),
        guardian.clone(),
        account.address,
        runner.client().chain_id().await.unwrap(),
    );

    let session_account = account
        .session_account(SigningKey::from_random(), vec![transfer_method], u64::MAX)
        .await
        .unwrap();
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    // New session should work
    contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_call_unallowed_methods() {
    let signer = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let runner = KatanaRunner::load();
    let account = runner.deploy_controller(&signer).await;

    // Create random allowed method
    let transfer_method = AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfer"));

    let session_account = account
        .session_account(
            SigningKey::from_random(),
            vec![transfer_method.clone()],
            u64::MAX,
        )
        .await
        .unwrap();

    let contract = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    let address = ContractAddress(account.address);
    let amount = U256 {
        high: 0,
        low: 0x10_u128,
    };

    // calling allowed method should succeed
    assert!(contract.transfer(&address, &amount).send().await.is_ok());

    // Perform contract invocation that is not part of the allowed methods
    let error = contract
        .approve(&address, &amount)
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

    let account = runner.deploy_controller(&signer).await;

    let controller = Controller::new(account.address, &account);
    let external_controller = Controller::new(controller.address, &external_account);

    // register_external_owner
    let tx = controller
        .register_external_owner(&external_account.address().into())
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    // external owner set_delegate_account
    let tx = external_controller
        .set_delegate_account(&delegate_address.into())
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    let delegate_account = controller.delegate_account().call().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr == delegate_address.into()),
        "should be delegate_address"
    );
}
