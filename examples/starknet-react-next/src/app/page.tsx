import { TransferEth } from "components/TransferEth";
import { ManualTransferEth } from "components/ManualTransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DelegateAccount } from "components/DelegateAccount";
import { ColorModeToggle } from "components/ColorModeToggle";
import { RegisterSession } from "components/RegisterSession";
import { Profile } from "components/Profile";
import { Settings } from "components/Settings";
import { FetchControllers } from "components/FetchControllers";

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
      <Settings />
      <Profile />
      <TransferEth />
      <ManualTransferEth />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
      <RegisterSession />
      <FetchControllers />
    </div>
  );
}
