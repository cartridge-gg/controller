"use client";

import { useAccount, useSendTransaction } from "@starknet-start/react";
import { useCallback, useEffect, useState } from "react";
import { constants } from "starknet";
import { Button, Input } from "@cartridge/controller-ui";
import { controllerConnector } from "./providers/StarknetProvider";

export const DelegateAccount = () => {
  const [chainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.SN_SEPOLIA,
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { address } = useAccount();
  const { sendAsync } = useSendTransaction({});

  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateAddressInput, setDelegateAddressInput] = useState("");
  const [isDelegateSupported, setIsDelegateSupported] = useState(false);

  const load = useCallback(async () => {
    if (!address) {
      return;
    }

    try {
      const delegate = await controllerConnector.delegateAccount();
      setDelegateAddress(delegate?.toString() || "");
      setIsDelegateSupported(true);
    } catch (e) {
      console.log(e);
      // controller doesnt support delegateAccount, ignore
    }
  }, [address]);

  const execute = useCallback(async () => {
    if (!address) {
      return;
    }
    setSubmitted(true);

    sendAsync([
      {
        contractAddress: address,
        entrypoint: "set_delegate_account",
        calldata: [delegateAddressInput],
      },
    ])
      .catch((e) => console.error(e))
      .finally(() => setSubmitted(false));
  }, [address, delegateAddressInput, sendAsync]);

  useEffect(() => {
    load();
  }, [address, chainId, load]);

  if (!address) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2>Delegate account</h2>

      <div className="flex items-center gap-2">
        Address:{" "}
        {isDelegateSupported ? (
          <>
            {delegateAddress}
            <Button onClick={() => load()}>Load</Button>
          </>
        ) : (
          "Not deployed"
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          className="max-w-40"
          type="text"
          min-width="420px"
          value={delegateAddressInput}
          onChange={(e) => setDelegateAddressInput(e.target.value)}
        />
        <Button onClick={() => execute()} disabled={submitted}>
          Set Delegate
        </Button>
      </div>
    </div>
  );
};
