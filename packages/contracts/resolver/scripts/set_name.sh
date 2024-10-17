#!/bin/bash
set -euo pipefail

NAME=$(starkli to-cairo-string $1)
STARKNET=$(starkli to-cairo-string starknet)
ADDRESS=$2

starkli invoke \
    --keystore-password executor \
    -w \
    $RESOLVER_ADDRESS set_name \
    $NAME $ADDRESS \
