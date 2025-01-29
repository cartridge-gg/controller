#!/bin/sh

set -ex

# Build account bundle
pnpm wasm-pack build --target bundler --out-dir ./pkg-controller --release --features "console-error-panic,controller_account"

# Build session bundle
pnpm wasm-pack build --target bundler --out-dir ./pkg-session --release --features "console-error-panic,session_account"
