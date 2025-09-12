import { ExternalWalletType } from "../types";
import { EthereumWalletBase } from "../ethereum-base";

export class MetaMaskWallet extends EthereumWalletBase {
  readonly type: ExternalWalletType = "metamask";
  readonly rdns = "io.metamask";
  readonly displayName = "MetaMask";
}
