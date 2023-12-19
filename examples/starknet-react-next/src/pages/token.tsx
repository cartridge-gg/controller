import {
  useAccount,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
import type { NextPage } from "next";
import { useCallback, useMemo, useState } from "react";
import { cairo, uint256 } from "starknet";
import { ConnectWallet } from "components/ConnectWallet";
import { TransactionList } from "components/TransactionList";
import { useTokenContract } from "hooks/token";
import { Abi } from "starknet";
import Erc20Abi from "abi/erc20.json";

function UserBalance() {
  const { account } = useAccount();

  const { data, isLoading, error } = useContractRead({
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

    // #223 check. it used to be `uint256.uint256ToBN(data[0])`
    const balance = uint256.uint256ToBN({ low: data[0], high: data[1] });
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

  const calls = useMemo(() => {
    if (!address || !contract) return [];

    const amountBn = cairo.uint256(amount);
    return contract.populateTransaction["mint"]!(address, [address, amountBn]);
  }, [address, contract]);

  const { writeAsync, isPending, error, reset } = useContractWrite({
    calls,
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
      writeAsync();
    }
  }, [account, amount]);

  const mintButtonDisabled = useMemo(() => {
    if (isPending) return true;
    return !account || !!amountError;
  }, [isPending, account, amountError]);

  return (
    <div>
      <h2>Mint token</h2>
      <p>
        <span>Amount: </span>
        <input
          type="number"
          onChange={(evt) => updateAmount(evt.target.value)}
        />
      </p>
      <button disabled={mintButtonDisabled} onClick={onMint}>
        {isPending ? "Submitting" : "Mint"}
      </button>
      {error && (
        <p>
          <>Error: {error}</>
        </p>
      )}
    </div>
  );
}

const TokenPage: NextPage = () => {
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
      <TransactionList />
    </div>
  );
};

export default TokenPage;
