import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DelegateAccount } from "components/DelegateAccount";
import { ColorModeToggle } from "components/ColorModeToggle";
import { Menu } from "components/Menu";
import { RegisterSession } from "components/RegisterSession";

export default function Home() {
  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold underline text-primary">
          Controller Example
        </h2>
        <ColorModeToggle />
      </div>
      <ConnectWallet />
      <Menu />
      <TransferEth />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
      <RegisterSession />
    </div>
  );
}
