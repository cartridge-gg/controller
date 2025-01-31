"use client";

import {
  useAccount,
  useReadContract,
  useSendTransaction,
} from "@starknet-react/core";
import { useCallback, useMemo, useState } from "react";
import { cairo, Call, CallData, uint256 } from "starknet";
import { ConnectWallet } from "components/ConnectWallet";
import { useTokenContract } from "hooks/token";
import { Abi } from "starknet";
import Erc20Abi from "abi/erc20.json";
import { Button, Input } from "@cartridge/ui";

function UserBalance() {
  const { account } = useAccount();

  const { data, isLoading, error } = useReadContract({
    abi: Erc20Abi as Abi,
    address:
      "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
    functionName: "balanceOf",
    args: account ? [account] : undefined,
  });

  const content = useMemo(() => {
    if (isLoading || !(data as [])?.length) {
      return <div>Loading balance</div>;
    }

    if (error) {
      console.error(error);
      return <div>Error!</div>;
    }

    const balance = uint256.uint256ToBN(cairo.uint256(data[0]));
    return <div>{balance.toString(10)}</div>;
  }, [data, isLoading, error]);

  return (
    <div>
      <h2>User balance</h2>
      {content}
    </div>
  );
}

function MintToken() {
  const { account, address } = useAccount();
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();

  const { contract } = useTokenContract();

  const calls: Call[] = useMemo(() => {
    if (!address || !contract) return [];

    const amountBn = cairo.uint256(amount);
    return [
      {
        contractAddress: contract.address,
        entrypoint: "mint",
        calldata: CallData.compile([address, amountBn]),
      },
    ];
  }, [address, contract, amount]);

  const { sendAsync, isPending, error, reset } = useSendTransaction({
    calls: calls,
  });

  const updateAmount = useCallback(
    (newAmount: string) => {
      // soft-validate amount
      setAmount(newAmount);
      try {
        BigInt(newAmount);
        setAmountError(undefined);
      } catch (err) {
        console.error(err);
        setAmountError("Please input a valid number");
      }
    },
    [setAmount],
  );

  const onMint = useCallback(() => {
    reset();
    if (account && !amountError) {
      sendAsync();
    }
  }, [account, amountError, reset, sendAsync]);

  const mintButtonDisabled = useMemo(() => {
    if (isPending) return true;
    return !account || !!amountError;
  }, [isPending, account, amountError]);

  return (
    <div>
      <h2>Mint token</h2>
      <p>
        <span>Amount: </span>
        <Input
          type="number"
          onChange={(evt) => updateAmount(evt.target.value)}
        />
      </p>
      <Button disabled={mintButtonDisabled} onClick={onMint}>
        {isPending ? "Submitting" : "Mint"}
      </Button>
      {error && (
        <p>
          <>Error: {error}</>
        </p>
      )}
    </div>
  );
}

export default function TokenPage() {
  const { address } = useAccount();

  if (!address) {
    return (
      <div>
        <p>Connect Wallet</p>
        <ConnectWallet />
      </div>
    );
  }
  return (
    <div>
      <p>Connected: {address}</p>
      <UserBalance />
      <MintToken />
    </div>
  );
}
