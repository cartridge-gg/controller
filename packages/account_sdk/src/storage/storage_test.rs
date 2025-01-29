#[cfg(test)]
mod tests {
    use crate::artifacts::{Version, CONTROLLERS};
    use crate::controller::Controller;
    use crate::signers::{Owner, Signer};
    use crate::storage::selectors::Selectors;
    use crate::storage::{StorageBackend, StorageError};
    use serde_json::json;
    use starknet_crypto::Felt;
    use url::Url;

    #[test]
    fn test_storage_serialization_error() {
        let app_id = "app_id".to_string();
        let mut controller = Controller::new(
            app_id.clone(),
            "username".to_string(),
            CONTROLLERS[&Version::LATEST].hash,
            Url::parse("https://rpc.katana.cartridge.gg").unwrap(),
            Owner::Signer(Signer::new_starknet_random()),
            Felt::ONE,
            Felt::ZERO,
        );

        // Create invalid JSON
        let corrupted_data = json!({
            "invalid_field": "invalid_value"
        })
        .to_string();

        // Store the corrupted data directly
        controller
            .storage
            .set_serialized(&Selectors::active(&app_id), &corrupted_data)
            .unwrap();

        // We want to test Controller::from_storage however it creates a new storage everytime, so instead we
        // test storage.controller to make sure it returns Serialization error
        let result = controller.storage.controller(&app_id);
        assert!(matches!(result, Err(StorageError::Serialization(_))));
    }
}
