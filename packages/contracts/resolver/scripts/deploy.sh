#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:8001/x/starknet/sepolia"
export ACCOUNT="../../../../../cartridge/account.json"
export ACCOUNT_KEYSTORE="../../../../../cartridge/keystore"

export UDC_ADDRESS="0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"

export ADMIN_ADDRESS="0x6bd82a20984e638c8e1d45770e2924e274e315b9609eb15c26384eac0094cf1"

export EXECUTOR_ADDRESS_1="0x1"
export EXECUTOR_ADDRESS_2="0x2"
export EXECUTOR_ADDRESS_3="0x6bd82a20984e638c8e1d45770e2924e274e315b9609eb15c26384eac0094cf1"

export RESOLVER_CLASS_HASH="0x0502af1b1d34e7d5f9ff6f9495e0f7a921dd48dd84055c4d8f6fc1b0a2021881"


starkli invoke $UDC_ADDRESS -w --account $ACCOUNT \
    --rpc $RPC_URL \
    --keystore $ACCOUNT_KEYSTORE \
    --keystore-password apidev \
    deployContract \
    $RESOLVER_CLASS_HASH \
    0x0 \
    0x0 \
    0x5 \
    $ADMIN_ADDRESS \
    0x3 $EXECUTOR_ADDRESS_1 $EXECUTOR_ADDRESS_2 $EXECUTOR_ADDRESS_3 \


