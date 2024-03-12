#!/bin/sh

set -ex

wasm-pack build --out-dir ../pkg --release --features console-error-panic
