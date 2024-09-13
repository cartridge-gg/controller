#!/bin/sh

set -ex

pnpm wasm-pack build --target bundler --out-dir ./pkg --release --features console-error-panic

# Workaround for ESM `import` error in NextJS.
# This removes `"type": "module"` field from `./pkg/packages.json`
mv pkg/package.json pkg/temp.json
jq -r 'del(.type)' pkg/temp.json > pkg/package.json
rm pkg/temp.json
