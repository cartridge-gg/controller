"use client";

import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { DelegateAccount } from "components/DelegateAccount";
import { ColorModeToggle } from "components/ColorModeToggle";
import { Menu } from "components/Menu";
import { KEYCHAIN_URL } from "components/providers/StarknetProvider";
import { useEffect, useState } from "react";

export default function Home() {
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    setDebug(!!new URLSearchParams(window.location.search).get("debug"));
  }, []);

  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold underline text-primary">
          Controller Example
        </h2>
        <ColorModeToggle />
      </div>

      {debug && (
        <div>
          <p>Keychain URL: {KEYCHAIN_URL}</p>
          <p>
            NEXT_PUBLIC_VERCEL_ENV: {String(process.env.NEXT_PUBLIC_VERCEL_ENV)}
          </p>
          <p>
            NEXT_PUBLIC_VERCEL_BRANCH_URL:{" "}
            {String(process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL)}
          </p>
          <p>
            NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:{" "}
            {String(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL)}
          </p>
        </div>
      )}

      <ConnectWallet />
      <Menu />
      <TransferEth />
      <DelegateAccount />
      <InvalidTxn />
      <SignMessage />
    </div>
  );
}
