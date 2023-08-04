import {
  useAccount,
  useContractRead,
  useStarknetInvoke,
} from "@starknet-react/core";
import type { NextPage } from "next";
import { useCallback, useMemo, useState } from "react";
import { number, uint256 } from "starknet";
import { ConnectWallet } from "components/ConnectWallet";
import { TransactionList } from "components/TransactionList";
import { useTokenContract } from "hooks/token";
import { Abi } from "starknet";
import Erc20Abi from "abi/erc20.json";

function UserBalance() {
  const { account } = useAccount();
  const { contract } = useTokenContract();

  const { data, isLoading, error } = useContractRead({
    abi: Erc20Abi as Abi,
    address:
      "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
    functionName: "balanceOf",
    args: account ? [account] : undefined,
  });

  const content = useMemo(() => {
    if (isLoading || !data?.length) {
      return <div>Loading balance</div>;
    }

    if (error) {
      console.error(error);
      return <div>Error!</div>;
    }

    const balance = uint256.uint256ToBN(data[0]);
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
  const { account } = useAccount();
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();

  const { contract } = useTokenContract();

  const { loading, error, reset, invoke } = useStarknetInvoke({
    contract,
    method: "mint",
  });

  const updateAmount = useCallback(
    (newAmount: string) => {
      // soft-validate amount
      setAmount(newAmount);
      try {
        number.toBN(newAmount);
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
      const amountBn = uint256.bnToUint256(amount);
      invoke({ args: [account, amountBn] });
    }
  }, [account, amount]);

  const mintButtonDisabled = useMemo(() => {
    if (loading) return true;
    return !account || !!amountError;
  }, [loading, account, amountError]);

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
        {loading ? "Waiting for wallet" : "Mint"}
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
