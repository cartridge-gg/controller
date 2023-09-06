import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, VStack, Spacer, Button } from "@chakra-ui/react";

import Controller from "utils/controller";
import {
  Abi,
  constants,
  number,
  Call as StarknetCall,
  InvocationsDetails,
  uint256,
} from "starknet";
import { Fees } from "./Fees";
import BN from "bn.js";
import { BigNumber, utils } from "ethers";
import { ExecuteReply, ResponseCodes } from "@cartridge/controller";
import { Container } from "../Container";
import { Status } from "utils/account";
import { LowEth, LowEthInfo } from "./LowEth";
import { BridgeEth } from "../bridge/BridgeEth";
import { PortalBanner } from "../PortalBanner";
import { TransactionDuoIcon } from "@cartridge/ui";
import { Call } from "./Call";
import {
  PORTAL_FOOTER_MIN_HEIGHT,
  PortalFooter,
} from "components/PortalFooter";

export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function Execute({
  origin,
  chainId,
  controller,
  transactions,
  transactionsDetail,
  abis,
  onExecute,
  onCancel,
  onLogout,
}: {
  origin: string;
  chainId: constants.StarknetChainId;
  controller: Controller;
  transactions: StarknetCall | StarknetCall[];
  transactionsDetail?: InvocationsDetails;
  abis?: Abi[];
  onExecute: (res: ExecuteReply) => void;
  onCancel: () => void;
  onLogout: () => void;
}) {
  const [fees, setFees] = useState<{
    base: BN;
    max: BN;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [ethBalance, setEthBalance] = useState<BN>();
  const [ethApproved, setEthApproved] = useState<BN>();
  const [lowEthInfo, setLowEthInfo] = useState<LowEthInfo>();
  const [bridging, setBridging] = useState<boolean>(false);

  const account = controller.account(chainId);
  const calls = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [transactions];
  }, [transactions]);

  const format = (bn: BN) => {
    return (
      Number(utils.formatEther(bn.toString()))
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
        calldata: [BigNumber.from(controller.address).toString()],
      })
      .then((res) => {
        setEthBalance(
          new BN(
            res.result
              .map((r) => r.replace("0x", ""))
              .reverse()
              .join(""),
            16,
          ),
        );
      });
  }, [account, controller]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) {
      return;
    }

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
        uint256.uint256ToBN({
          low: approve[0].calldata[1],
          high: approve[0].calldata[2],
        }),
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

  useEffect(() => {
    if (!ethBalance || !ethApproved) {
      return;
    }

    if (ethBalance.lt(ethApproved)) {
      setLowEthInfo({
        label: "Approved Eth",
        balance: format(ethBalance),
        max: format(ethApproved),
        lowAmount: format(ethBalance.sub(ethApproved).mul(new BN("-1"))),
        reject: onCancel,
        onBridge: () => setBridging(true),
      });
    } else if (fees?.max && ethBalance.lt(ethApproved.add(fees.max))) {
      setLowEthInfo({
        label: "Network Fee",
        balance: format(ethBalance),
        max: format(ethApproved.add(fees.max)),
        lowAmount: format(
          ethBalance.sub(ethApproved.add(fees.max)).mul(new BN("-1")),
        ),
        reject: onCancel,
        onBridge: () => setBridging(true),
      });
    }
  }, [ethBalance, ethApproved, fees?.max, onCancel]);

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

  const onBack = useCallback(() => {
    setBridging(false);
  }, []);

  if (bridging) {
    return (
      <Container
        chainId={chainId}
        address={account.address}
        onLogout={onLogout}
        onBack={onBack}
      >
        <BridgeEth chainId={chainId} controller={controller} />
      </Container>
    );
  }

  return (
    <Container chainId={chainId} address={account.address} onLogout={onLogout}>
      <PortalBanner Icon={TransactionDuoIcon} title="Submit Transaction" />

      <VStack w="full" pb={lowEthInfo ? undefined : PORTAL_FOOTER_MIN_HEIGHT}>
        <VStack spacing="1px" w="full" borderRadius="md" bg="solid.primary">
          <VStack w="full" p={3} align="flex-start">
            <Text fontSize="xs" fontWeight="bold" color="text.secondaryAccent">
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
                _last={{ borderBottomRadius: "md" }}
              />
            ))}
          </VStack>
        </VStack>

        {lowEthInfo ? (
          <>
            <Spacer />
            <LowEth {...lowEthInfo} />
          </>
        ) : (
          <VStack w="full">
            <Fees
              error={error}
              chainId={chainId}
              fees={fees}
              balance={ethBalance && format(ethBalance)}
              approved={ethApproved && format(ethApproved)}
            />

            <PortalFooter>
              <Button
                colorScheme="colorful"
                onClick={onSubmit}
                isLoading={isLoading}
                isDisabled={!fees}
              >
                submit
              </Button>

              <Button onClick={onCancel}>Cancel</Button>
            </PortalFooter>
          </VStack>
        )}
      </VStack>
    </Container>
  );
}
