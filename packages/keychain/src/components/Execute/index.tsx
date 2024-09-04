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
import { num } from "starknet";

export const WEBAUTHN_GAS = 3300n;
export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function Execute() {
  const { controller, context, origin, paymaster, cancel } = useConnection();
  const ctx = context as ExecuteCtx;

  const [maxFee, setMaxFee] = useState<bigint>(0n);
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
  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) return;

    const estimateFees = async () => {
      try {
        const balance = await getEthBalance(account, controller.address);
        setEthBalance(balance);

        const maxFee = await calculateMaxFee(ctx, account, calls, balance);
        setMaxFee(maxFee);
      } catch (e) {
        if (e instanceof Error && e.message === "Insufficient funds") {
          setIsInsufficient(true);
        }
        setError(e);
      }
    };

    estimateFees();
  }, [controller, calls, account, ctx, setError, setMaxFee]);

  const getEthBalance = async (account, address) => {
    const res = await account.callContract({
      contractAddress: CONTRACT_ETH,
      entrypoint: "balanceOf",
      calldata: [BigInt(address).toString()],
    });
    return BigInt(
      `0x${res
        .map((r) => r.replace("0x", ""))
        .reverse()
        .join("")}`,
    );
  };

  const calculateMaxFee = async (ctx, account, calls, balance) => {
    if (ctx.transactionsDetail?.maxFee) {
      const requested = BigInt(ctx.transactionsDetail.maxFee);
      if (requested > balance) throw Error("Insufficient funds");
      return requested;
    }

    const est = await account.estimateInvokeFee(calls, ctx.transactionsDetail);
    const maxFee = est.suggestedMaxFee + WEBAUTHN_GAS * BigInt(est.gas_price);
    if (maxFee > balance) throw Error("Insufficient funds");
    return maxFee;
  };

  const execute = useCallback(async () => {
    if (!paymaster) {
      let { transaction_hash } = await account.execute(calls, {
        maxFee: num.toHex(maxFee),
      });

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
          let { transaction_hash } = await account.execute(calls, {
            maxFee: num.toHex(maxFee),
          });

          return transaction_hash;
        } else {
          throw error; // Re-throw other errors
        }
      } else {
        throw error;
      }
    }
  }, [account, calls, paymaster, maxFee]);

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
          <Fees maxFee={maxFee} />
        )}
        <Button
          colorScheme="colorful"
          onClick={onSubmit}
          isLoading={isLoading}
          isDisabled={!maxFee}
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
