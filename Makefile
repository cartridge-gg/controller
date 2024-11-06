# Starkli config.
config := --account katana-0 \
	--rpc http://0.0.0.0:5050

# Build files helpers.
build := ./target/dev/controller_
sierra := .contract_class.json
compiled := .compiled_contract_class.json
store := ./packages/account_sdk/artifacts/classes/

# Contract params for deploy.
test_pubkey = 0x1234
katana_0 = 0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973

generate_artifacts:
	scarb --manifest-path ./packages/contracts/controller/Scarb.toml build
	mkdir -p ${store}

	jq . ${build}CartridgeAccount${sierra} > ${store}controller.latest.contract_class.json

	cp ${build}CartridgeAccount${compiled} ${store}controller.latest.compiled_contract_class.json

test-session: generate_artifacts
	rm -rf ./account_sdk/log
	cargo test --manifest-path account_sdk/Cargo.toml session -- --nocapture

clean:
	rm -rf ./target
