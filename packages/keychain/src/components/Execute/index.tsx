import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, VStack, Button } from "@chakra-ui/react";
import { Call as StarknetCall, InvocationsDetails } from "starknet";
import { Fees } from "./Fees";
import { formatEther } from "viem";
import { ExecuteReply, ResponseCodes } from "@cartridge/controller";
import {
  Container,
  Content,
  FOOTER_MIN_HEIGHT,
  Footer,
} from "components/layout";
import { Status } from "utils/account";
import { TransactionDuoIcon } from "@cartridge/ui";
import { Call } from "./Call";
import { InsufficientFunds } from "./InsufficientFunds";
import { useChainId, useOrigin } from "hooks/connection";
import { useController } from "hooks/controller";
import { ErrorAlert } from "components/ErrorAlert";

export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function Execute({
  transactions,
  transactionsDetail,
  onExecute,
  onCancel,
}: {
  transactions: StarknetCall | StarknetCall[];
  transactionsDetail?: InvocationsDetails;
  onExecute: (res: ExecuteReply) => void;
  onCancel: () => void;
}) {
  const chainId = useChainId();
  const { controller } = useController();
  const origin = useOrigin();

  const [fees, setFees] = useState<{
    base: bigint;
    max: bigint;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [ethBalance, setEthBalance] = useState<bigint>(0n);
  const [isInsufficient, setIsInsufficient] = useState<boolean>(false);

  const account = controller.account;
  const calls = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [transactions];
  }, [transactions]);

  const format = (val: bigint) => {
    return (
      Number(formatEther(val))
        .toFixed(5)
        // strips trailing 0s
        .replace(/0*$/, "$'")
    );
  };

  useEffect(() => {
    account
      .callContract({
        contractAddress: CONTRACT_ETH,
        entrypoint: "balanceOf",
        calldata: [BigInt(controller.address).toString()],
      })
      .then((res) => {
        setEthBalance(
          BigInt(
            `0x${res
              .map((r) => r.replace("0x", ""))
              .reverse()
              .join("")}`,
          ),
        );
      });
  }, [account, controller]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) {
      return;
    }

    if (account.status === Status.DEPLOYED && transactionsDetail.maxFee) {
      setFees({
        base: BigInt(transactionsDetail.maxFee),
        max: BigInt(transactionsDetail.maxFee),
      });
      return;
    }

    account
      .estimateInvokeFee(calls, transactionsDetail)
      .then((fees) => {
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      })
      .catch((e) => {
        console.error(e);
        setError(e);
      });
  }, [
    account,
    controller,
    setError,
    setFees,
    calls,
    chainId,
    transactionsDetail,
  ]);

  useEffect(() => {
    if (!ethBalance || !fees) {
      return;
    }

    if (ethBalance < fees.max) {
      setIsInsufficient(true);
    }
  }, [ethBalance, fees]);

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

  if (isInsufficient) {
    return (
      <InsufficientFunds
        address={controller.account.address}
        balance={format(ethBalance)}
      />
    );
  }

  return (
    <Container
      Icon={TransactionDuoIcon}
      title="Confirm Transaction"
      description={origin}
    >
      <Content pb={FOOTER_MIN_HEIGHT}>
        <VStack spacing="1px" w="full" borderRadius="md" bg="solid.primary">
          <VStack w="full" p={3} align="flex-start">
            <Text fontSize="xs" fontWeight="bold" color="text.secondaryAccent">
              Transaction Details
            </Text>
          </VStack>

          <VStack w="full" spacing="1px">
            {calls.map((call, i) => (
              <Call
                key={i}
                policy={{
                  target: call.contractAddress,
                  method: call.entrypoint,
                }}
                _last={{ borderBottomRadius: "md" }}
              />
            ))}
          </VStack>
        </VStack>

        <Fees
          error={error}
          fees={fees}
          balance={ethBalance && format(ethBalance)}
        />
      </Content>

      <Footer>
        {error && (
          <ErrorAlert
            title="Fee estimation failed"
            description={error.message}
          />
        )}
        <Button
          colorScheme="colorful"
          onClick={onSubmit}
          isLoading={isLoading}
          isDisabled={!fees}
        >
          submit
        </Button>

        <Button onClick={onCancel}>Cancel</Button>
      </Footer>
    </Container>
  );
}
