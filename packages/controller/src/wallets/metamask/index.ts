import { ExternalWalletType } from "../types";
import { EthereumWalletBase } from "../ethereum-base";

export class MetaMaskWallet extends EthereumWalletBase {
  readonly type: ExternalWalletType = "metamask";
  readonly rdns = "io.metamask";
  readonly displayName = "MetaMask";

  protected getFallbackProvider(): any {
    return (window as any).ethereum?.isMetaMask
      ? (window as any).ethereum
      : null;
  }
}
