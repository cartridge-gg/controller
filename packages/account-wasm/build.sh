#!/bin/sh

set -ex

pnpm dlx wasm-pack build --out-dir ./pkg --release --features console-error-panic
