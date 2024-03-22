import { useContractRead } from "@starknet-react/core";
import type { NextPage } from "next";
import { useMemo } from "react";
import { TransferEth } from "components/TransferEth";
import { ConnectWallet } from "components/ConnectWallet";
import { IncrementCounter } from "components/IncrementCounter";
import { InvalidTxn } from "components/InvalidTxn";
import { SignMessage } from "components/SignMessage";
import { useCounterContract } from "hooks/counter";
import Quests from "components/Quest";
import { Abi } from "starknet";
import CounterAbi from "abi/counter.json";

const Home: NextPage = () => {
  const { contract: counter } = useCounterContract();

  const { data: counterResult } = useContractRead({
    abi: CounterAbi as Abi,
    address:
      "0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1",
    functionName: "counter",
    args: [],
    watch: true,
  });

  const counterValue = useMemo(() => {
    const val = Array.isArray(counterResult) ? counterResult[0] : counterResult;
    return val.toString(10);
  }, [counterResult]);

  return (
    <div>
      <h2>Wallet</h2>
      <ConnectWallet />
      <h2>Counter Contract</h2>
      <p>Address: {counter?.address}</p>
      <p>Value: {counterValue}</p>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <IncrementCounter />
        <InvalidTxn />
      </div>
      <h2>Quests</h2>
      <Quests />
      <SignMessage />
      <TransferEth />
      <h2>Recent Transactions</h2>
    </div>
  );
};

export default Home;
