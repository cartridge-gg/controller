import { Button } from "@chakra-ui/react";
import BN from "bn.js";
import { parseEther } from "ethers/lib/utils.js";
import { useCallback, useEffect, useState } from "react";
import { constants, uint256 } from "starknet";
import {
  goerli,
  mainnet,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import {
  EthL1BridgeGoerli,
  EthL1BridgeMainnet,
  EthL2BridgeGoerli,
  EthL2BridgeMainnet,
} from "./constants";
import EthL1BridgeABI from "./abis/EthL1Bridge.json";
import { BigNumber } from "ethers";
import Account from "utils/account";

export function TransferButton({
  account,
  value,
  disabled,
  onError,
  onTxSubmitted,
}: {
  account: Account;
  value: string;
  disabled: boolean;
  onError: (err: any) => void;
  onTxSubmitted: (hash: string) => void;
}) {
  const [l2Fee, setL2Fee] = useState<string>();

  const estimateL2Fee = useCallback(async () => {
    const parsed = parseEther(value);
    const amount = uint256.bnToUint256(new BN(parsed.toString()));
    const from =
      account._chainId === constants.StarknetChainId.SN_MAIN
        ? EthL1BridgeMainnet
        : EthL1BridgeGoerli;
    const to =
      account._chainId === constants.StarknetChainId.SN_MAIN
        ? EthL2BridgeMainnet
        : EthL2BridgeGoerli;
    const res = await account.rpc.estimateMessageFee({
      from_address: from,
      to_address: to,
      entry_point_selector: "handle_deposit",
      payload: [account.address, amount.low.toString(), amount.high.toString()],
    });
    return res;
  }, [account._chainId, account.rpc, account.address, value]);

  useEffect(() => {
    if (!value) return;
    estimateL2Fee().then((res) => {
      setL2Fee(res.overall_fee);
    });
  }, [estimateL2Fee, value]);

  const { config, error: configError } = usePrepareContractWrite({
    chainId:
      account._chainId === constants.StarknetChainId.SN_MAIN
        ? mainnet.id
        : goerli.id,
    address:
      account._chainId === constants.StarknetChainId.SN_MAIN
        ? EthL1BridgeMainnet
        : EthL1BridgeGoerli,
    abi: EthL1BridgeABI,
    functionName: "deposit",
    args: [
      parseEther(value?.length ? value : "0"),
      BigNumber.from(account.address),
    ],
    overrides: {
      value: value && l2Fee ? parseEther(value).add(l2Fee) : undefined,
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
    <Button w="full" disabled={disabled || !write} onClick={() => write?.()}>
      Transfer
    </Button>
  );
}
