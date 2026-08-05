"use client";

import { useAccount } from "@starknet-start/react";
import { useCallback, useState } from "react";
import { controllerConnector } from "./providers/StarknetProvider";
import { lookupAddresses, lookupUsernames } from "@cartridge/controller";
import { Button } from "@cartridge/controller-ui";

export function LookupControllers() {
  const { address } = useAccount();
  const [error, setError] = useState<Error>();
  const [addressToUsername, setAddressToUsername] =
    useState<Map<string, string>>();
  const [usernameToAddress, setUsernameToAddress] =
    useState<Map<string, string>>();
  const onClick = useCallback(async () => {
    if (!address) return;

    setError(undefined);
    try {
      const username = await controllerConnector.username()!;
      const [addressResults, usernameResults] = await Promise.all([
        lookupAddresses([address]),
        lookupUsernames([username]),
      ]);

      setAddressToUsername(addressResults);
      setUsernameToAddress(usernameResults);
    } catch (e) {
      setError(e as Error);
    }
  }, [address]);

  if (!address) return null;

  return (
    <div>
      <h2>Lookup Controllers</h2>
      <h3>Address to Username</h3>
      {addressToUsername &&
        [...addressToUsername].map(([addr, username]) => (
          <p key={addr}>
            {addr}: {username}
          </p>
        ))}
      <h3>Username to Address</h3>
      {usernameToAddress &&
        [...usernameToAddress].map(([username, addr]) => (
          <p key={username}>
            {username}: {addr}
          </p>
        ))}
      {error && <p className="error">{error.message}</p>}
      <Button onClick={onClick}>Lookup Controllers</Button>
    </div>
  );
}
