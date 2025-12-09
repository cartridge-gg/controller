import { ExternalWalletType } from "../types";
import { EthereumWalletBase } from "../ethereum-base";

export class PhantomEVMWallet extends EthereumWalletBase {
  readonly type: ExternalWalletType = "phantom-evm";
  readonly rdns = "app.phantom";
  readonly displayName = "Phantom";

  isAvailable(): boolean {
    const available = super.isAvailable();
    console.log('[PhantomEVM] isAvailable check:', {
      available,
      hasPhantomGlobal: !!(window as any).phantom,
      hasPhantomEthereum: !!(window as any).phantom?.ethereum,
      hasEthereumIsPhantom: !!(window as any).ethereum?.isPhantom,
    });
    return available;
  }
}
