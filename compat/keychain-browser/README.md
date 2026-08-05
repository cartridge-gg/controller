# Hosted keychain browser compatibility

This harness builds three isolated host applications from the actual published
Controller `0.13.12`, published Controller `0.13.13`, and a packed candidate
`0.14.0-alpha.1`. Every host embeds the same candidate Starknet.js v10 keychain
on a second origin and communicates through the real Penpal transport.

`packages/keychain/compat.html` calls the unchanged production
`connectToController` method-table factory. It makes the harness deterministic
by replacing only the storage and account service boundaries beneath the real
connect, probe, switch-chain, execute, sign, fee, update-session, and disconnect
handlers. The method table, origin normalization, callback-backed navigation,
structured cloning, iframe lifecycle, and both directions of Penpal
communication remain unmocked.

`0.14.0-alpha.1` is staged prerelease metadata applied only to the packed
current candidate build. The harness does not publish a package.

Run the required matrix with:

```sh
pnpm compat:keychain
```
