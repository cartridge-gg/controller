"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import React, { useEffect, useState } from "react";
import { Button } from "@cartridge/ui-next";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors[0] as CartridgeConnector;

  const [username, setUsername] = useState<string>();
  useEffect(() => {
    if (!address) return;
    connector.username()?.then((n) => setUsername(n));
  }, [address, connector]);

  return (
    <div>
      {address && (
        <>
          <p>Account: {address} </p>
          {username && <p>Username: {username}</p>}
        </>
      )}

      <Button
        onClick={() => {
          address ? disconnect() : connect({ connector });
        }}
      >
        {address ? "Disconnect" : "Connect"}
      </Button>
    </div>
  );
}
