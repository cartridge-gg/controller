import { ExternalWalletType } from "../types";
import { EthereumWalletBase } from "../ethereum-base";

export class BaseWallet extends EthereumWalletBase {
  readonly type: ExternalWalletType = "base";
  readonly rdns = "com.coinbase.wallet";
  readonly displayName = "Base Wallet";
}
