// Ambient Window augmentation for the injected wallet globals the SDK probes
// (src/wallets/*) and the bridge instance it exposes for debugging. INTERNAL
// only: this file is excluded from declaration emission (see the dts plugin
// exclude in vite.config.js) so the published packages don't merge these
// members — `ethereum?: any` etc. — into consumers' own Window typings. It is
// also why the emitted entries carry no `declare global` block, which the
// type bundler would otherwise append to every entry, dangling in ones that
// don't declare WalletBridge.
interface Window {
  ethereum?: any;
  solana?: any;
  starknet_argentX?: any;
  starknet_braavos?: any;
  wallet_bridge?: import("./wallets/bridge").WalletBridge;
}
