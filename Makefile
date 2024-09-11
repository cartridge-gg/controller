# Starkli config.
config := --account katana-0 \
	--rpc http://0.0.0.0:5050

# Build files helpers.
build_controller := ./target/dev/controller_
build_tokens := ./target/dev/tokens_
sierra := .contract_class.json
compiled := .compiled_contract_class.json
store := ./packages/account_sdk/compiled/

# Contract params for deploy.
test_pubkey = 0x1234
katana_0 = 0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973

generate_artifacts:
	scarb --manifest-path ./packages/contracts/controller/Scarb.toml build
	mkdir -p ${store}

	jq . ${build_controller}CartridgeAccount${sierra} > ${store}controller${sierra}
	cp ${build_controller}CartridgeAccount${compiled} ${store}controller${compiled}

	scarb --manifest-path ./packages/contracts/tokens/Scarb.toml build
	mkdir -p ${store}

	jq . ${build_tokens}AvatarNft${sierra} > ${store}avatar${sierra}
	cp ${build_tokens}AvatarNft${compiled} ${store}avatar${compiled}


deploy-katana:
	@set -x; \
	erc20_class=$$(starkli class-hash ${build_controller}ERC20Upgradeable${sierra}); \
	account_class=$$(starkli class-hash ${build_controller}Account${sierra}); \
	starkli declare ${build_controller}Account${sierra} ${config}; \
	starkli deploy "$${account_class}" ${test_pubkey} --salt 0x1234 ${config}; \
	starkli declare ${build_controller}ERC20Upgradeable${sierra} ${config}; \
	starkli deploy "$${erc20_class}" str:token str:tkn u256:1 ${katana_0} --salt 0x1234 ${config};

test-session: generate_artifacts
	rm -rf ./account_sdk/log
	cargo test --manifest-path account_sdk/Cargo.toml session -- --nocapture

clean:
	rm -rf ./target
