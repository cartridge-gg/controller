#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:8001/x/starknet/sepolia"
export ACCOUNT="../../../../../cartridge/account.json"
export ACCOUNT_KEYSTORE="../../../../../cartridge/keystore"

export RESOLVER_ADDRESS="0x468a75c755cc663618f5424fae7e2c2f85c1a8d7a38157f4b0ecb0f1b815443"

export NAME=$(starkli to-cairo-string $1)
export STARKNET=$(starkli to-cairo-string starknet)

echo $NAME
echo $STARKNET

starkli call \
    --rpc $RPC_URL \
    $RESOLVER_ADDRESS resolve \
    0x1 $NAME $STARKNET 0x0 \
