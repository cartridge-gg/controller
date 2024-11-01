import { Transfer } from "components/Transfer";
import { ManualTransferEth } from "components/ManualTransferEth";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DelegateAccount } from "components/DelegateAccount";
import { ColorModeToggle } from "components/ColorModeToggle";
import { Profile } from "components/Profile";
import { LookupControllers } from "components/LookupControllers";
import Header from "components/Header";

export default function Home() {
  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold underline text-primary">
          Controller Example (Next.js)
        </h2>
        <ColorModeToggle />
      </div>
      <Header />
      <Profile />
      <Transfer />
      <ManualTransferEth />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
      <LookupControllers />
    </div>
  );
}
