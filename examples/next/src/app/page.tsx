"use client";

import { FC } from "react";

import { ColorModeToggle } from "components/ColorModeToggle";
import Header from "components/Header";
import { DelegateAccount } from "components/DelegateAccount";
import { InvalidTxn } from "components/InvalidTxn";
import { LookupControllers } from "components/LookupControllers";
import { ManualTransferEth } from "components/ManualTransferEth";
import { Profile } from "components/Profile";
import { SignMessage } from "components/SignMessage";
import { Transfer } from "components/Transfer";

const Home: FC = () => {
  return (
    <main className="flex flex-col p-4 gap-4">
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
    </main>
  );
};

export default Home;
