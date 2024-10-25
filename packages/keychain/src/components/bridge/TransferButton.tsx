import { Button } from "@chakra-ui/react";
import { parseEther } from "viem";
import { useCallback, useEffect, useState } from "react";
import { cairo, constants } from "starknet";
import { mainnet, useContractWrite, usePrepareContractWrite } from "wagmi";
import { goerli, sepolia } from "wagmi/chains";
import {
  EthL1BridgeGoerli,
  EthL1BridgeMainnet,
  EthL1BridgeSepolia,
  EthL2BridgeGoerli,
  EthL2BridgeMainnet,
  EthL2BridgeSepolia,
} from "./constants";
import EthL1BridgeABI from "./abis/EthL1Bridge.json";
import Controller from "utils/controller";

export function TransferButton({
  account,
  value,
  disabled,
  onError,
  onTxSubmitted,
}: {
  account: Controller;
  value: string;
  disabled: boolean;
  onError: (err: any) => void;
  onTxSubmitted: (hash: string) => void;
}) {
  const [l2Fee, setL2Fee] = useState<string>();

  const estimateL2Fee = useCallback(async () => {
    const parsed = parseEther(value);
    const amount = cairo.uint256(BigInt(parsed.toString()));
    const from =
      account.chainId() === constants.StarknetChainId.SN_MAIN
        ? EthL1BridgeMainnet
        : account.chainId() === constants.StarknetChainId.SN_SEPOLIA
        ? EthL1BridgeSepolia
        : EthL1BridgeGoerli;
    const to =
      account.chainId() === constants.StarknetChainId.SN_MAIN
        ? EthL2BridgeMainnet
        : account.chainId() === constants.StarknetChainId.SN_SEPOLIA
        ? EthL2BridgeSepolia
        : EthL2BridgeGoerli;
    const res = await account.estimateMessageFee({
      from_address: from,
      to_address: to,
      entry_point_selector: "handle_deposit",
      payload: [account.address, amount.low.toString(), amount.high.toString()],
    });
    return res;
  }, [account, value]);

  useEffect(() => {
    if (!value) return;
    estimateL2Fee().then((res) => {
      setL2Fee(res.overall_fee);
    });
  }, [estimateL2Fee, value]);

  const { config, error: configError } = usePrepareContractWrite({
    chainId:
      account.chainId() === constants.StarknetChainId.SN_MAIN
        ? mainnet.id
        : account.chainId() === constants.StarknetChainId.SN_SEPOLIA
        ? sepolia.id
        : goerli.id,
    address:
      account.chainId() === constants.StarknetChainId.SN_MAIN
        ? EthL1BridgeMainnet
        : account.chainId() === constants.StarknetChainId.SN_SEPOLIA
        ? EthL2BridgeSepolia
        : EthL1BridgeGoerli,
    abi: EthL1BridgeABI,
    functionName: "deposit",
    args: [parseEther(value?.length ? value : "0"), BigInt(account.address)],
    overrides: {
      value: value && l2Fee ? parseEther(value) + BigInt(l2Fee) : undefined,
    },
    enabled: !disabled && value && !!l2Fee,
  });

  const { data, write } = useContractWrite(config);

  useEffect(() => {
    if (configError) {
      onError(configError);
    } else {
      // reset err message
      onError(null);
    }
    if (data?.hash) {
      onTxSubmitted(data.hash);
    }
  }, [configError, onError, data?.hash, onTxSubmitted]);

  return (
    <Button w="full" onClick={() => write?.()}>
      Transfer
    </Button>
  );
}
