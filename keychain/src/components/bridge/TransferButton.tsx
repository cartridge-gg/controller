import { Button } from "@chakra-ui/react";
import BN from "bn.js";
import { parseEther } from "ethers/lib/utils.js";
import { useCallback, useEffect, useState } from "react";
import { constants, Sequencer, SequencerProvider, uint256 } from "starknet";
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

const TransferButton = ({
  account,
  value,
  disabled,
  onError,
  onTxSubmitted,
}: {
  account: any;
  value: string;
  disabled: boolean;
  onError: (err: any) => void;
  onTxSubmitted: (hash: string) => void;
}) => {
  const [l2Fee, setL2Fee] = useState<number>();

  const estimateL2Fee =
    useCallback(async (): Promise<Sequencer.EstimateFeeResponse> => {
      const gateway = new SequencerProvider({
        network:
          account._chainId === constants.StarknetChainId.MAINNET
            ? "mainnet-alpha"
            : "goerli-alpha",
      });
      const parsed = parseEther(value);
      const amount = uint256.bnToUint256(new BN(parsed.toString()));
      const from =
        account._chainId === constants.StarknetChainId.MAINNET
          ? EthL1BridgeMainnet
          : EthL1BridgeGoerli;
      const to =
        account._chainId === constants.StarknetChainId.MAINNET
          ? EthL2BridgeMainnet
          : EthL2BridgeGoerli;
      const res = await gateway.estimateMessageFee({
        from_address: from,
        to_address: to,
        entry_point_selector: "handle_deposit",
        payload: [account.address, amount.low, amount.high],
      });
      return res;
    }, [account._chainId, account.address, value]);

  useEffect(() => {
    if (!value) return;
    estimateL2Fee().then((res) => {
      setL2Fee((res as any).overall_fee);
    });
  }, [estimateL2Fee, value]);

  const { config, error: configError } = usePrepareContractWrite({
    chainId:
      account._chainId === constants.StarknetChainId.MAINNET
        ? mainnet.id
        : goerli.id,
    address:
      account._chainId === constants.StarknetChainId.MAINNET
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
};

export default TransferButton;
