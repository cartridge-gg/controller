import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DojoSpawnAndMove } from "components/DojoSpawnAndMove";
import { DelegateAccount } from "components/DelegateAccount";

export default function Home() {
  return (
    <div className="flex flex-col p-4 gap-4">
      <h2 className="text-3xl font-bold underline text-primary">
        Controller Example
      </h2>
      <ConnectWallet />
      <DojoSpawnAndMove />
      <TransferEth />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
    </div>
  );
}
