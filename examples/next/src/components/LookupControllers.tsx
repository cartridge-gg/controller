"use client";

import { useAccount } from "@starknet-react/core";
import { useCallback, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { lookupAddresses, lookupUsernames } from "@cartridge/controller";
import { Button } from "@cartridge/ui";

export function LookupControllers() {
  const { address, connector } = useAccount();
  const [error, setError] = useState<Error>();
  const [addressToUsername, setAddressToUsername] =
    useState<Map<string, string>>();
  const [usernameToAddress, setUsernameToAddress] =
    useState<Map<string, string>>();
  const cartridgeConnector = connector as never as ControllerConnector;

  const onClick = useCallback(async () => {
    if (!address) return;

    setError(undefined);
    try {
      const username = await cartridgeConnector.username()!;
      const [addressResults, usernameResults] = await Promise.all([
        lookupAddresses([address]),
        lookupUsernames([username]),
      ]);

      setAddressToUsername(addressResults);
      setUsernameToAddress(usernameResults);
    } catch (e) {
      setError(e as Error);
    }
  }, [address, cartridgeConnector]);

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
