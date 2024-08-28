#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:8001/x/starknet/sepolia"
export ACCOUNT="../../../../../cartridge/account.json"
export ACCOUNT_KEYSTORE="../../../../../cartridge/keystore"

export RESOLVER_ADDRESS="0x"

export NAME=$(starkli to-cairo-string $1)

echo $NAME

starkli invoke $RESOLVER_ADDRESS -w \
    --rpc $RPC_URL \
    --account $ACCOUNT \
    --keystore $ACCOUNT_KEYSTORE \
    --keystore-password apidev \
    reset_name \
    $NAME \
