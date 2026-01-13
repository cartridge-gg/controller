"use client";

import { FC } from "react";

import { ColorModeToggle } from "components/ColorModeToggle";
import Header from "components/Header";
import { DelegateAccount } from "components/DelegateAccount";
import { HeadlessLogin } from "components/HeadlessLogin";
import { InvalidTxn } from "components/InvalidTxn";
import { LookupControllers } from "components/LookupControllers";
import { ManualTransferEth } from "components/ManualTransferEth";
import { PlayButton } from "components/PlayButton";
import { Profile } from "components/Profile";
import { SignMessage } from "components/SignMessage";
import { Transfer } from "components/Transfer";
import { Starterpack } from "components/Starterpack";

const Home: FC = () => {
  return (
    <main className="w-screen overflow-x-hidden flex flex-col p-4 gap-4">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold underline text-primary">
          Controller Example (Next.js)
        </h2>
        <ColorModeToggle />
      </div>
      <Header />
      <PlayButton />
      <Profile />
      <HeadlessLogin />
      <Transfer />
      <ManualTransferEth />
      <Starterpack />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
      <LookupControllers />
    </main>
  );
};

export default Home;
