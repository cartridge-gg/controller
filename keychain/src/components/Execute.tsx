import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, Circle, HStack, VStack } from "@chakra-ui/react";

import Controller from "utils/controller";
import {
  Abi,
  constants,
  number,
  Call as StarknetCall,
  InvocationsDetails,
  uint256,
} from "starknet";
import { Call } from "components/Call";
import Footer from "components/Footer";
import Fees from "components/Fees";
import TransactionIcon from "./icons/Transaction";
import BN from "bn.js";
import { BigNumber, utils } from "ethers";
import {
  Error as ErrorReply,
  ExecuteReply,
  ResponseCodes,
} from "@cartridge/controller";
import Container from "./Container";
import { Status } from "utils/account";
import { Header } from "./Header";

export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const Execute = ({
  origin,
  chainId,
  controller,
  transactions,
  transactionsDetail,
  abis,
  onExecute,
  onCancel,
}: {
  origin: string;
  chainId: constants.StarknetChainId;
  controller: Controller;
  transactions: StarknetCall | StarknetCall[];
  transactionsDetail?: InvocationsDetails;
  abis?: Abi[];
  onExecute: (res: ExecuteReply) => void;
  onCancel: (error: ErrorReply) => void;
}) => {
  const [fees, setFees] = useState<{
    base: BN;
    max: BN;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [ethBalance, setEthBalance] = useState<string>();
  const [ethApproved, setEthApproved] = useState<string>();

  const account = controller.account(chainId);
  const calls = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [transactions];
  }, [transactions]);

  useEffect(() => {
    account
      .callContract({
        contractAddress: CONTRACT_ETH,
        entrypoint: "balanceOf",
        calldata: [BigNumber.from(controller.address).toString()],
      })
      .then((res) =>
        setEthBalance(
          utils.formatEther(
            BigNumber.from(
              "0x" +
                res.result
                  .map((r) => r.replace("0x", ""))
                  .reverse()
                  .join(""),
            ),
          ),
        ),
      );
  }, [account, controller]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) {
      return;
    }

    setFees({
      base: number.toBN("10000000000000000000000"),
      max: number.toBN("10000000000000000000000"),
    });
    return;

    if (account.status === Status.REGISTERED && transactionsDetail.maxFee) {
      setFees({
        base: number.toBN(transactionsDetail.maxFee),
        max: number.toBN(transactionsDetail.maxFee),
      });
      return;
    }

    const approve: StarknetCall[] = calls.filter(
      (call) =>
        call.contractAddress === CONTRACT_ETH && call.entrypoint === "approve",
    );

    if (approve.length > 0) {
      setEthApproved(
        utils.formatEther(
          uint256
            .uint256ToBN({
              low: approve[0].calldata[1],
              high: approve[0].calldata[2],
            })
            .toString(),
        ),
      );
    }

    account
      .estimateInvokeFee(calls, transactionsDetail)
      .then((fees) => {
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      })
      .catch((e) => setError(e));
  }, [
    account,
    controller,
    setEthApproved,
    setError,
    setFees,
    calls,
    chainId,
    transactionsDetail,
  ]);

  const onSubmit = useCallback(async () => {
    setLoading(true);
    const response = await account.execute(calls, null, {
      maxFee: fees.max,
    });

    onExecute({
      transaction_hash: response.transaction_hash,
      code: ResponseCodes.SUCCESS,
    });
  }, [account, calls, fees, onExecute]);

  return (
    <Container>
      <Header
        chainId={chainId}
        address={account.address}
        onClose={() => {
          onCancel({
            code: ResponseCodes.CANCELED,
            message: "Cancelled",
          });
        }}
      />
      <HStack w="full" justify="flex-start" pb="20px" spacing="20px">
        <Circle bgColor="gray.700" size="48px">
          <TransactionIcon boxSize="30px" />
        </Circle>
        <Text fontSize="17px" fontWeight="bold">
          Submit Transaction
        </Text>
      </HStack>
      <VStack spacing="1px" w="full">
        <VStack
          w="full"
          p="12px"
          align="flex-start"
          bgColor="gray.700"
          borderRadius="6px 6px 0 0"
        >
          <Text variant="ibm-upper-bold" fontSize="10px" color="gray.200">
            Actions
          </Text>
        </VStack>
        <VStack w="full" spacing="1px">
          {calls.map((call, i) => (
            <Call
              key={i}
              chainId={chainId}
              policy={{
                target: call.contractAddress,
                method: call.entrypoint,
              }}
              _last={{ borderRadius: "0 0 6px 6px" }}
            />
          ))}
        </VStack>
      </VStack>
      <Footer
        isLoading={isLoading}
        isDisabled={!fees}
        confirmText="Submit"
        onConfirm={onSubmit}
        onCancel={() => {
          onCancel({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          });
        }}
      >
        <Fees
          error={error}
          chainId={chainId}
          fees={fees}
          balance={ethBalance}
          approved={ethApproved}
        />
      </Footer>
    </Container>
  );
};

export default Execute;
