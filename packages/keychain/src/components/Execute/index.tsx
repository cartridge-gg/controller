import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@chakra-ui/react";
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
import { ControllerErrorAlert } from "components/ErrorAlert";
import { Policies } from "Policies";
import { Fees } from "./Fees";
import { ExecuteCtx } from "utils/connection";
import { num } from "starknet";
import { ErrorType, JsControllerError } from "@cartridge/account-wasm";
import { DeploymentRequired } from "components/DeploymentRequired";

export const WEBAUTHN_GAS = 3300n;
export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function Execute() {
  const { controller, context, origin, paymaster } = useConnection();
  const ctx = context as ExecuteCtx;

  const [maxFee, setMaxFee] = useState<bigint>(0n);
  const [error, setError] = useState<JsControllerError>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isDeploy, setIsDeploy] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);

  const account = controller.account;
  const calls = useMemo(() => {
    return Array.isArray(ctx.transactions)
      ? ctx.transactions
      : [ctx.transactions];
  }, [ctx.transactions]);

  // const format = (val: bigint) => {
  //   const formatted = Number(formatEther(val)).toFixed(5);
  //   if (formatted === "0.00000") {
  //     return "0.0";
  //   }
  //   return formatted.replace(/\.?0+$/, "");
  // };

  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) return;

    const estimateFees = async () => {
      try {
        const est = await account.estimateInvokeFee(
          calls,
          ctx.transactionsDetail,
        );
        setMaxFee(est.overall_fee);
      } catch (e) {
        setError(e);
      }
    };

    estimateFees();
  }, [controller, calls, account, ctx, setError, setMaxFee]);

  const execute = useCallback(async () => {
    if (!paymaster) {
      let { transaction_hash } = await account.execute(calls, {
        maxFee: num.toHex(maxFee),
      });

      return transaction_hash;
    }

    try {
      return await account.executeFromOutside(calls, paymaster);
    } catch (e) {
      let { transaction_hash } = await account.execute(calls, {
        maxFee: num.toHex(maxFee),
      });

      return transaction_hash;
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

  if (isFunding && error.error_type === ErrorType.InsufficientBalance) {
    return <InsufficientFunds error={error} />;
  }

  if (isDeploy) {
    return <DeploymentRequired onClose={() => {}} />;
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

      {error &&
      error.error_type === ErrorType.CartridgeControllerNotDeployed ? (
        <DeployFooter setIsDeploy={setIsDeploy} error={error} />
      ) : error && error.error_type === ErrorType.InsufficientBalance ? (
        <FundingFooter maxFee={maxFee} setIsFunding={setIsFunding} />
      ) : (
        <ExecuteFooter
          error={error}
          maxFee={maxFee}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
    </Container>
  );
}

const DeployFooter = ({ setIsDeploy, error }) => (
  <Footer>
    <ControllerErrorAlert error={error} />
    <Button colorScheme="colorful" onClick={() => setIsDeploy(true)}>
      DEPLOY ACCOUNT
    </Button>
  </Footer>
);

const FundingFooter = ({ maxFee, setIsFunding }) => (
  <Footer>
    <Fees maxFee={maxFee} />

    <Button colorScheme="colorful" onClick={() => setIsFunding(true)}>
      ADD FUNDS
    </Button>
  </Footer>
);

const ExecuteFooter = ({ error, maxFee, onSubmit, isLoading }) => (
  <Footer>
    {error ? <ControllerErrorAlert error={error} /> : <Fees maxFee={maxFee} />}

    <Button
      colorScheme="colorful"
      onClick={onSubmit}
      isLoading={isLoading}
      isDisabled={!maxFee}
    >
      SUBMIT
    </Button>
  </Footer>
);
