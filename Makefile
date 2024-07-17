# Starkli config.
config := --account katana-0 \
	--rpc http://0.0.0.0:5050

# Build files helpers.
build := ./target/dev/controller_
sierra := .contract_class.json
compiled := .compiled_contract_class.json
store := ./packages/account_sdk/compiled/

# Contract params for deploy.
test_pubkey = 0x1234
katana_0 = 0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973

generate_artifacts:
	scarb --manifest-path ./packages/contracts/controller/Scarb.toml build
	mkdir -p ${store}

	jq . ${build}CartridgeAccount${sierra} > ${store}controller${sierra}
	jq . ${build}ERC20Upgradeable${sierra} > ${store}erc20${sierra}

	cp ${build}CartridgeAccount${compiled} ${store}controller${compiled}
	cp ${build}ERC20Upgradeable${compiled} ${store}erc20${compiled}

	cainome --artifacts-path packages/account_sdk/compiled --parser-config packages/account_sdk/parser_config.json --output-dir packages/account_sdk/src/abigen --execution-version v1 --rust&& cargo fmt -p account_sdk

deploy-katana:
	@set -x; \
	erc20_class=$$(starkli class-hash ${build}ERC20Upgradeable${sierra}); \
	account_class=$$(starkli class-hash ${build}Account${sierra}); \
	starkli declare ${build}Account${sierra} ${config}; \
	starkli deploy "$${account_class}" ${test_pubkey} --salt 0x1234 ${config}; \
	starkli declare ${build}ERC20Upgradeable${sierra} ${config}; \
	starkli deploy "$${erc20_class}" str:token str:tkn u256:1 ${katana_0} --salt 0x1234 ${config};

test-session: generate_artifacts
	rm -rf ./account_sdk/log
	cargo test --manifest-path account_sdk/Cargo.toml session -- --nocapture

clean:
	rm -rf ./target
