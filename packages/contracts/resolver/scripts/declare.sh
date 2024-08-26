#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:8001/x/starknet/sepolia"
export ACCOUNT="../../../../../cartridge/account.json"
export ACCOUNT_KEYSTORE="../../../../../cartridge/keystore"

export RESOLVER_SIERRA="../../../target/dev/resolver_ControllerResolverDelegation.contract_class.json"

starkli declare -w --account $ACCOUNT $RESOLVER_SIERRA \
    --rpc $RPC_URL \
    --keystore $ACCOUNT_KEYSTORE \
    --keystore-password apidev \
