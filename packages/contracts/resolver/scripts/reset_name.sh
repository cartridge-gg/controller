#!/bin/bash
set -euo pipefail

NAME=$(starkli to-cairo-string $1)

starkli invoke $RESOLVER_ADDRESS -w \
    --keystore-password executor \
    reset_name \
    $NAME \
