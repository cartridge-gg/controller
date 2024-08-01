import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@chakra-ui/react";
import { formatEther } from "viem";
import { Policy, ResponseCodes } from "@cartridge/controller";
import {
  Container,
  Content,
  FOOTER_MIN_HEIGHT,
  Footer,
} from "components/layout";
import { Status } from "utils/account";
import { TransactionDuoIcon } from "@cartridge/ui";
import { InsufficientFunds } from "./InsufficientFunds";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "components/ErrorAlert";
import { Policies } from "Policies";
import { Fees } from "./Fees";
import { ExecuteCtx } from "utils/connection";
import { TransferAmountExceedsBalance } from "errors";
import { ETH_MIN_PREFUND } from "utils/token";
import { num } from "starknet";

export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function Execute() {
  const { chainId, controller, context, origin, cancel } = useConnection();
  const ctx = context as ExecuteCtx;

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
    return Array.isArray(ctx.transactions)
      ? ctx.transactions
      : [ctx.transactions];
  }, [ctx.transactions]);

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

    if (account.status === Status.DEPLOYED && ctx.transactionsDetail?.maxFee) {
      setFees({
        base: BigInt(ctx.transactionsDetail.maxFee),
        max: BigInt(ctx.transactionsDetail.maxFee),
      });
      return;
    }

    account
      .estimateInvokeFee(calls, ctx.transactionsDetail)
      .then((fees) => {
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      })
      .catch((e) => {
        if (e.message.includes("ERC20: transfer amount exceeds balance")) {
          setIsInsufficient(true);
          setError(new TransferAmountExceedsBalance());
          return;
        }

        setError(e);
      });
  }, [origin, account, controller, setError, setFees, calls, chainId, ctx]);

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

    // TODO: calculate webauthn validation cost separately
    const maxFee = num.toHex(ctx.transactionsDetail?.maxFee || ETH_MIN_PREFUND);
    const { transaction_hash } = await account.execute(calls, {
      maxFee,
    });
    ctx.resolve({
      transaction_hash,
      code: ResponseCodes.SUCCESS,
    });
  }, [account, calls, fees, ctx, origin, controller]);

  const policies = useMemo<Policy[]>(
    () =>
      calls.map((c) => ({ target: c.contractAddress, method: c.entrypoint })),
    [calls],
  );

  if (isInsufficient) {
    return (
      <InsufficientFunds
        address={controller.address}
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
        <Policies title="Transaction Details" policies={policies} />
      </Content>

      <Footer>
        {error ? (
          error.name === "TransferAmountExceedsBalance" ? (
            <ErrorAlert title={error.message} />
          ) : (
            <ErrorAlert
              title="Something went wrong"
              description={error.message}
            />
          )
        ) : (
          <Fees fees={fees} balance={ethBalance && format(ethBalance)} />
        )}
        <Button
          colorScheme="colorful"
          onClick={onSubmit}
          isLoading={isLoading}
          isDisabled={!fees}
        >
          submit
        </Button>

        <Button onClick={cancel}>Cancel</Button>
      </Footer>
    </Container>
  );
}
