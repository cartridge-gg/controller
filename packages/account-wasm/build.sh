#!/bin/sh

set -ex

# Build account bundle
pnpm wasm-pack build --target bundler --out-dir ./pkg-controller --release --features "console-error-panic,controller_account"

# Build session bundle
pnpm wasm-pack build --target bundler --out-dir ./pkg-session --release --features "console-error-panic,session_account"

# Workaround for ESM `import` error in NextJS.
# This removes `"type": "module"` field from the package.json files
for dir in pkg-controller pkg-session; do
    mv $dir/package.json $dir/temp.json
    jq -r 'del(.type)' $dir/temp.json >$dir/package.json
    rm $dir/temp.json
done
