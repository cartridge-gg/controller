"use client";

import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { constants } from "starknet";
import CartridgeConnector from "@cartridge/connector";
import { Button, Input } from "@cartridge/ui-next";

export const DelegateAccount = () => {
  const [chainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.SN_SEPOLIA,
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account, connector } = useAccount();

  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateAddressInput, setDelegateAddressInput] = useState("");
  const [isDelegateSupported, setIsDelegateSupported] = useState(false);

  const cartridgeConnector = connector as unknown as CartridgeConnector;

  const load = useCallback(async () => {
    if (!account) {
      return;
    }

    try {
      const delegate = await cartridgeConnector.delegateAccount();
      setDelegateAddress(delegate?.toString() || "");
      setIsDelegateSupported(true);
    } catch (e: any) {
      console.log(e);
      // controller doesnt support delegateAccount, ignore
    }
  }, [account, chainId, cartridgeConnector]);

  const execute = useCallback(async () => {
    if (!account) {
      return;
    }
    setSubmitted(true);

    account
      .execute([
        {
          contractAddress: account.address,
          entrypoint: "set_delegate_account",
          calldata: [delegateAddressInput],
        },
      ])
      .catch((e) => console.error(e))
      .finally(() => setSubmitted(false));
  }, [account, delegateAddressInput]);

  useEffect(() => {
    load();
  }, [account, chainId, load]);

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2>Delegate account</h2>
      {isDelegateSupported ? (
        <>
          <p>
            Address: {delegateAddress}
            <Button onClick={() => load()}>Load</Button>
          </p>

          <div className="flex gap-2">
            <Input
              className="max-w-40"
              type="text"
              min-width="420px"
              value={delegateAddressInput}
              onChange={(e: any) => setDelegateAddressInput(e.target.value)}
            />
            <Button onClick={() => execute()} disabled={submitted}>
              Set Delegate
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => cartridgeConnector.openSetDelegate(delegateAddressInput)}>Open Set Delegate</Button>
          </div>
        </>
      ) : (
        <p>Not supported!</p>
      )}
    </div>
  );
};
