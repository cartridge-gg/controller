import { ExternalWalletType } from "../types";
import { EthereumWalletBase } from "../ethereum-base";

export class RabbyWallet extends EthereumWalletBase {
  readonly type: ExternalWalletType = "rabby";
  readonly rdns = "io.rabby";
  readonly displayName = "Rabby";
}
