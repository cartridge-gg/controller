"use client";

import { useAccount } from "@starknet-react/core";
import { Button } from "@cartridge/ui-next";

export function RegisterSession() {
  const { account } = useAccount();

  const registerSessionUrl = "http://localhost:3001/session?public_key=0x2cb057c18198ae4555a144bfdace051433b9a545dc88224de58fa04e323f269&redirect_uri=https://t.me/hitthingbot/hitthing&redirect_query_name=startapp&policies=%5B%7B%22target%22:%220x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645%22,%22method%22:%22attack%22,%22description%22:%22Attack%20the%20beast%22%7D,%7B%22target%22:%220x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645%22,%22method%22:%22claim%22,%22description%22:%22Claim%20your%20tokens%22%7D%5D&rpc_url=https://api.cartridge.gg/x/starknet/sepolia";

  const openRegisterSessionUrl = () => {
    window.open(registerSessionUrl, '_blank', 'noopener,noreferrer');
  };

  if (!account) {
    return null;
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <h2>Register Session</h2>
      <Button onClick={openRegisterSessionUrl}>
        Register Session
      </Button>
    </div>
  );
}
