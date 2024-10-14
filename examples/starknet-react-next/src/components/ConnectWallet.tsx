"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import React, { useEffect, useState } from "react";
import { Button } from "@cartridge/ui-next";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors[0] as ControllerConnector;

  const [username, setUsername] = useState<string>();
  useEffect(() => {
    if (!address) return;
    connector.username()?.then((n) => setUsername(n));
  }, [address, connector]);

  const registerSessionUrl =
    "http://localhost:3001/session?public_key=0x2cb057c18198ae4555a144bfdace051433b9a545dc88224de58fa04e323f269&redirect_uri=http://localhost:3002&policies=%5B%7B%22target%22:%220x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645%22,%22method%22:%22attack%22,%22description%22:%22Attack%20the%20beast%22%7D,%7B%22target%22:%220x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645%22,%22method%22:%22claim%22,%22description%22:%22Claim%20your%20tokens%22%7D%5D&rpc_url=http://localhost:8001/x/starknet/sepolia";

  const openRegisterSessionUrl = () => {
    window.open(registerSessionUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      {address && (
        <>
          <p>Account: {address} </p>
          {username && <p>Username: {username}</p>}
        </>
      )}
      {address ? (
        <Button onClick={() => disconnect()}>Disconnect</Button>
      ) : (
        <>
          <Button onClick={() => connect({ connector })}>Connect</Button>
          <Button onClick={openRegisterSessionUrl}>Register Session</Button>
        </>
      )}
    </div>
  );
}
