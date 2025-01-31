"use client";

import { useAccount } from "@starknet-react/core";
import { Button } from "@cartridge/ui";
import { ec, stark } from "starknet";
import { useCallback, useState } from "react";

const HIT_THING_ADDRESS =
  "0x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645";
const redirectUri = encodeURIComponent("https://t.me/hitthingbot/hitthing");
const redirectQueryName = "startapp";
const policies = {
  contracts: {
    [HIT_THING_ADDRESS]: {
      methods: [
        { name: "Attack", entrypoint: "attack" },
        { name: "Claim", entrypoint: "claim" },
      ],
    },
  },
};
const encodedPolicies = encodeURIComponent(JSON.stringify(policies));

export function RegisterSession() {
  const { account } = useAccount();
  const [sessionKey, setSessionKey] = useState<string>();

  const onRegister = useCallback(() => {
    const privkey = stark.randomAddress();
    const pubkey = ec.starkCurve.getStarkKey(privkey);
    setSessionKey(privkey);

    const registerSessionUrl = `${process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL}/session?public_key=${pubkey}&redirect_uri=${redirectUri}&redirect_query_name=${redirectQueryName}&policies=${encodedPolicies}&rpc_url=${process.env.NEXT_PUBLIC_RPC_SEPOLIA}`;
    window.open(registerSessionUrl, "_blank", "noopener,noreferrer");
  }, []);

  const onRegisterSame = useCallback(() => {
    if (!sessionKey) {
      return;
    }

    const pubkey = ec.starkCurve.getStarkKey(sessionKey);
    const registerSessionUrl = `${process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL}/session?public_key=${pubkey}&redirect_uri=${redirectUri}&redirect_query_name=${redirectQueryName}&policies=${encodedPolicies}&rpc_url=${process.env.NEXT_PUBLIC_RPC_SEPOLIA}`;
    window.open(registerSessionUrl, "_blank", "noopener,noreferrer");
  }, [sessionKey]);

  if (!account) {
    return null;
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <h2>Register Session</h2>
      {sessionKey && <p>Session Key: {sessionKey}</p>}
      <Button onClick={onRegister}>Register New Session</Button>
      {sessionKey && (
        <Button onClick={onRegisterSame}>Register same key</Button>
      )}
    </div>
  );
}
