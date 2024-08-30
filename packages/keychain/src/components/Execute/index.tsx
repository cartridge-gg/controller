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
  const { chainId, controller, context, origin, paymaster, cancel } =
    useConnection();
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
    const formatted = Number(formatEther(val)).toFixed(5);
    if (formatted === "0.00000") {
      return "0.0";
    }
    return formatted.replace(/\.?0+$/, "");
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

    if (ctx.transactionsDetail?.maxFee) {
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

  const execute = useCallback(async () => {
    if (!paymaster) {
      const maxFee = num.toHex(
        ctx.transactionsDetail?.maxFee || ETH_MIN_PREFUND,
      );
      let { transaction_hash } = await account.execute(calls, { maxFee });

      return transaction_hash;
    }

    try {
      return await account.executeFromOutside(calls, paymaster);
    } catch (error) {
      if (error instanceof Error) {
        // Handle outside execution validation errors
        // NOTE: These should probably never happen.
        if (error.message.includes("-32602")) {
          if (error.message.includes("execution time not yet reached")) {
            console.warn(
              "Execution time not yet reached. Please try again later.",
            );
            setError(
              new Error(
                "Execution time not yet reached. Please try again later.",
              ),
            );
            return;
          }

          if (error.message.includes("execution time has passed")) {
            console.warn(
              "Execution time has passed. This transaction is no longer valid.",
            );
            setError(
              new Error(
                "Execution time has passed. This transaction is no longer valid.",
              ),
            );
            return;
          }

          if (error.message.includes("invalid caller")) {
            console.warn("Invalid caller for this transaction.");
            setError(new Error("Invalid caller for this transaction."));
            return;
          }
        }

        // Rate limit error, fallback to manual flow and let user know with info banner.
        if (error.message.includes("-32005")) {
          console.warn("Rate limit exceeded. Please try again later.");
          setError(new Error("Rate limit exceeded. Please try again later."));
          return;
        }

        // Paymaster not supported
        if (error.message.includes("-32003")) {
          // Handle the specific error, e.g., fallback to non-paymaster execution
          console.warn(
            "Paymaster not supported, falling back to regular execution",
          );
          const maxFee = num.toHex(
            ctx.transactionsDetail?.maxFee || ETH_MIN_PREFUND,
          );
          let { transaction_hash } = await account.execute(calls, { maxFee });
          return transaction_hash;
        } else {
          throw error; // Re-throw other errors
        }
      } else {
        throw error;
      }
    }
  }, [account, calls, paymaster, ctx.transactionsDetail]);

  const onSubmit = useCallback(async () => {
    setLoading(true);

    try {
      let transaction_hash = await execute();
      ctx.resolve({
        transaction_hash,
        code: ResponseCodes.SUCCESS,
      });
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [ctx, execute, setError, setLoading]);

  const policies = useMemo<Policy[]>(
    () =>
      calls.map((c) => ({ target: c.contractAddress, method: c.entrypoint })),
    [calls],
  );

  if (isInsufficient) {
    return <InsufficientFunds balance={format(ethBalance)} />;
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

      <Footer hideTxSummary>
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
          <Fees fees={fees} />
        )}
        <Button
          colorScheme="colorful"
          onClick={onSubmit}
          isLoading={isLoading}
          isDisabled={!fees}
        >
          submit
        </Button>

        <Button
          onClick={() => {
            ctx.onCancel ? ctx.onCancel() : cancel();
          }}
        >
          Cancel
        </Button>
      </Footer>
    </Container>
  );
}
