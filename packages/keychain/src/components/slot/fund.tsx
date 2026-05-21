import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTeamsQuery } from "@cartridge/controller-ui/utils/api/cartridge";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CheckIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  TokenCard,
  TokenSummary,
} from "@cartridge/controller-ui";
import {
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Team, Teams } from "./teams";
import { formatBalance } from "@/hooks/tokens";
import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { SlotCryptoFund, SlotFundingResult } from "./crypto-fund";
import { TeamEmailVerify } from "./team-email-verify";
import { waitForCryptoPaymentConfirmation } from "@/hooks/payments/crypto";
import { ConfirmingTransaction } from "@/components/purchase/pending";
import { getExplorer } from "@/hooks/starterpack/layerswap";
import { ErrorAlert } from "@/components/ErrorAlert";

enum FundState {
  SELECT_TEAM,
  COLLECT_EMAIL,
  PURCHASE,
  SUCCESS,
}

export function Fund() {
  const { navigate } = useNavigation();
  const { pathname } = useLocation();
  const [state, setState] = useState<FundState>(FundState.SELECT_TEAM);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [lastFunding, setLastFunding] = useState<
    SlotFundingResult | undefined
  >();

  const {
    data: teamsData,
    isLoading,
    error,
    refetch: refetchTeams,
  } = useTeamsQuery(undefined, { refetchInterval: 1000 });

  useEffect(() => {
    if (error) {
      navigate(`/slot?returnTo=${encodeURIComponent(pathname)}`, {
        replace: true,
      });
    }
  }, [navigate, pathname, error]);

  const teams: Team[] = useMemo(
    () =>
      teamsData?.me?.teams?.edges
        ?.filter((edge) => edge?.node != null)
        .map((edge) => {
          const node = edge!.node! as Team & { strk?: number };
          return { ...node, strk: node.strk ?? 0 };
        }) || [],
    [teamsData?.me?.teams?.edges],
  );

  useEffect(() => {
    if (selectedTeam && teams.length > 0) {
      const updatedTeam = teams.find((team) => team.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
    }
  }, [teams, selectedTeam]);

  if (state === FundState.SELECT_TEAM) {
    return (
      <Teams
        teams={teams}
        isLoading={isLoading}
        error={!!error}
        onFundTeam={(team) => {
          setSelectedTeam(team);
          setState(team.email ? FundState.PURCHASE : FundState.COLLECT_EMAIL);
        }}
      />
    );
  }

  if (state === FundState.COLLECT_EMAIL) {
    if (!selectedTeam) {
      return null;
    }

    return (
      <TeamEmailVerify
        team={selectedTeam}
        onBack={() => setState(FundState.SELECT_TEAM)}
        onVerified={(email) => {
          setSelectedTeam((prev) => (prev ? { ...prev, email } : prev));
          setState(FundState.PURCHASE);
        }}
      />
    );
  }

  if (state === FundState.PURCHASE) {
    if (!selectedTeam) {
      return null;
    }

    return (
      <SlotCryptoFund
        team={selectedTeam}
        onBack={() => setState(FundState.SELECT_TEAM)}
        onComplete={(result) => {
          setLastFunding(result);
          setState(FundState.SUCCESS);
        }}
      />
    );
  }

  if (!selectedTeam || !lastFunding) {
    return null;
  }

  return (
    <FundingComplete
      team={selectedTeam}
      funding={lastFunding}
      onPaymentConfirmed={refetchTeams}
      onDone={() => {
        setState(FundState.SELECT_TEAM);
        setSelectedTeam(undefined);
        setLastFunding(undefined);
      }}
    />
  );
}

type Step = "loading" | "success" | "error";

function FundingComplete({
  team,
  funding,
  onDone,
  onPaymentConfirmed,
}: {
  team: Team;
  funding: SlotFundingResult;
  onDone: () => void;
  onPaymentConfirmed: () => void;
}) {
  const { controller, isMainnet } = useConnection();
  const [txStatus, setTxStatus] = useState<Step>("loading");
  const [paymentStatus, setPaymentStatus] = useState<Step>("loading");
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!controller) return;

    let cancelled = false;
    (async () => {
      try {
        await controller.provider.waitForTransaction(funding.transactionHash, {
          retryInterval: 1000,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        });
        if (cancelled) return;
        setTxStatus("success");

        await waitForCryptoPaymentConfirmation(funding.paymentId);
        if (cancelled) return;
        setPaymentStatus("success");
        onPaymentConfirmed();
      } catch (err) {
        if (cancelled) return;
        const asError = err instanceof Error ? err : new Error(String(err));
        setError(asError);
        setTxStatus((prev) => (prev === "success" ? prev : "error"));
        setPaymentStatus((prev) =>
          prev === "success" ? prev : prev === "loading" ? "error" : prev,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    controller,
    funding.paymentId,
    funding.transactionHash,
    onPaymentConfirmed,
  ]);

  const allDone = paymentStatus === "success";
  const teamCreditsUsd = formatBalance(BigInt(team.credits || 0), 8, 2);
  const teamBalance =
    funding.token.key === "STRK"
      ? `${formatBalance(BigInt(team.strk || 0), 6, 2)} STRK`
      : `${teamCreditsUsd} USD`;

  const explorer = getExplorer(
    "starknet",
    funding.transactionHash,
    !!isMainnet,
  );

  return (
    <>
      <HeaderInner
        icon={<CheckIcon />}
        variant="compressed"
        title={allDone ? "Purchase Complete" : "Funding Team"}
      />
      <LayoutContent className="pb-3">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case font-semibold text-xs">
              {`Funded ${team.name}`}
            </CardTitle>
          </CardHeader>
          <TokenSummary className="rounded-tl-none rounded-tr-none">
            <TokenCard
              image={
                funding.token.key === "STRK"
                  ? funding.token.icon
                  : "https://static.cartridge.gg/media/usd_icon.svg"
              }
              title={funding.token.key === "STRK" ? "STRK" : "USD"}
              amount={teamBalance}
            />
          </TokenSummary>
        </Card>
      </LayoutContent>
      <LayoutFooter>
        {error && allDone === false && (
          <ErrorAlert
            variant="error"
            title="Funding Error"
            description={error.message}
          />
        )}
        <ConfirmingTransaction
          title={
            txStatus === "success"
              ? "Confirmed on Starknet"
              : txStatus === "error"
                ? "Transaction failed"
                : "Confirming on Starknet"
          }
          status={txStatus}
          externalLink={explorer?.url}
        />
        <ConfirmingTransaction
          title={
            paymentStatus === "success"
              ? "Payment received"
              : paymentStatus === "error"
                ? "Payment not received"
                : "Processing payment"
          }
          status={paymentStatus}
        />
        <Button disabled={!allDone} onClick={onDone}>
          Fund More Teams
        </Button>
      </LayoutFooter>
    </>
  );
}
