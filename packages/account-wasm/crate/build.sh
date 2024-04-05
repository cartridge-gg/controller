#!/bin/sh

set -ex

pnpx wasm-pack build --out-dir ../pkg --release --features console-error-panic
