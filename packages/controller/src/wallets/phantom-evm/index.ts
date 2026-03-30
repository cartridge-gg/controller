import { ExternalWalletType } from "../types";
import { EthereumWalletBase } from "../ethereum-base";

export class PhantomEVMWallet extends EthereumWalletBase {
  readonly type: ExternalWalletType = "phantom-evm";
  readonly rdns = "app.phantom";
  readonly displayName = "Phantom";

  protected getFallbackProvider(): any {
    return (window as any).phantom?.ethereum ?? null;
  }
}
