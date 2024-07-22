import type { NextPage } from "next";
import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DojoSpawnAndMove } from "components/DojoSpawnAndMove";
import { DelegateAccount } from "components/DelegateAccount";
import { Upgrade } from "components/Upgrade";

const Home: NextPage = () => {
  return (
    <div>
      <h2>Wallet</h2>
      <ConnectWallet />
      <DojoSpawnAndMove />
      <TransferEth />
      <Upgrade />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
    </div>
  );
};

export default Home;
