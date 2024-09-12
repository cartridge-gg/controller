#!/bin/bash
set -euo pipefail

NAME=$(starkli to-cairo-string $1)
STARKNET=$(starkli to-cairo-string starknet)

starkli call \
    $RESOLVER_ADDRESS resolve \
    0x1 $NAME $STARKNET 0x0 \
