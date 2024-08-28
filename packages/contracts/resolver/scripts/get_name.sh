#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:8001/x/starknet/sepolia"
export ACCOUNT="../../../../../cartridge/account.json"
export ACCOUNT_KEYSTORE="../../../../../cartridge/keystore"

export RESOLVER_ADDRESS="0x"

export NAME=$(starkli to-cairo-string $1)
export STARKNET=$(starkli to-cairo-string starknet)

echo $NAME
echo $STARKNET

starkli call \
    --rpc $RPC_URL \
    $RESOLVER_ADDRESS resolve \
    0x1 $NAME $STARKNET 0x0 \
