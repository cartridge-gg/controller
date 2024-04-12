import type { NextPage } from "next";
import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DojoSpawnAndMove } from "components/DojoSpawnAndMove";

const Home: NextPage = () => {
  return (
    <div>
      <div>
        <p>VERCEL_ENV: {process.env.NEXT_PUBLIC_VERCEL_ENV}</p>
        <p>VERCEL_URL: {process.env.NEXT_PUBLIC_VERCEL_URL}</p>
        <p>VERCEL_BRANCH_URL: {process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}</p>
        <p>
          Keychain URL: https://
          {process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
            ? (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL as string).replace(
                "cartridge-starknet-react-next-git",
                "keychain-git",
              )
            : process.env.XFRAME_URL}
        </p>
      </div>
      <h2>Wallet</h2>
      <ConnectWallet />
      <DojoSpawnAndMove />
      <SignMessage />
      <TransferEth />
      <InvalidTxn />
    </div>
  );
};

export default Home;
