import type { NextPage } from "next";
import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DojoSpawnAndMove } from "components/DojoSpawnAndMove";

const Home: NextPage = () => {
  return (
    <div>
      <h2>Wallet</h2>
      <ConnectWallet />
      <DojoSpawnAndMove />
      <TransferEth />
      <SignMessage />
      <InvalidTxn />
    </div>
  );
};

export default Home;
