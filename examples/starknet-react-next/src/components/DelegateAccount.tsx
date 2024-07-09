import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { constants } from "starknet";
import CartridgeConnector from "@cartridge/connector";

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
      // controller doesnt support delegateAccount, ignore
    }
  }, [account, cartridgeConnector]);

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
    <>
      <h2>Delegate account</h2>
      {isDelegateSupported ? (
        <>
          <p>
            Address: {delegateAddress}
            <button onClick={() => load()}>Load</button>
          </p>

          <input
            type="text"
            min-width="420px"
            value={delegateAddressInput}
            onChange={(e) => setDelegateAddressInput(e.target.value)}
          />
          <button onClick={() => execute()} disabled={submitted}>
            Set Delegate
          </button>
        </>
      ) : (
        <p>Not supported!</p>
      )}
    </>
  );
};
