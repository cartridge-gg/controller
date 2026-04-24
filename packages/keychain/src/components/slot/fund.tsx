import { useEffect, useState, useMemo } from "react";
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
import { Team, Teams } from "./teams";
import { formatBalance } from "@/hooks/tokens";
import { useNavigation } from "@/context/navigation";
import { SlotCryptoFund, SlotFundingResult } from "./crypto-fund";

enum FundState {
  SELECT_TEAM,
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
          setState(FundState.PURCHASE);
          setSelectedTeam(team);
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
          refetchTeams();
          setState(FundState.SUCCESS);
        }}
      />
    );
  }

  const fundedAmount =
    lastFunding &&
    `${formatBalance(lastFunding.amount, lastFunding.token.decimals, 2)} ${lastFunding.token.symbol}`;
  const teamCreditsUsd = formatBalance(
    BigInt(selectedTeam?.credits || 0),
    8,
    2,
  );
  const teamBalance =
    lastFunding?.token.key === "STRK"
      ? `${formatBalance(BigInt(selectedTeam?.strk || 0), 6, 2)} STRK`
      : `${teamCreditsUsd} USD`;

  return (
    <>
      <HeaderInner
        icon={<CheckIcon />}
        variant="compressed"
        title="Purchase Complete"
      />
      <LayoutContent className="pb-3">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case font-semibold text-xs">
              {`Funded ${selectedTeam?.name}`}
            </CardTitle>
          </CardHeader>
          <TokenSummary className="rounded-tl-none rounded-tr-none">
            {lastFunding && (
              <TokenCard
                image={lastFunding.token.icon}
                title={lastFunding.token.symbol}
                amount={fundedAmount ?? ""}
              />
            )}
            <TokenCard
              image={
                lastFunding?.token.key === "STRK"
                  ? lastFunding.token.icon
                  : "https://static.cartridge.gg/media/usd_icon.svg"
              }
              title={
                lastFunding?.token.key === "STRK" ? "Team STRK" : "Team Credits"
              }
              amount={teamBalance}
              value={
                lastFunding?.token.key === "STRK"
                  ? undefined
                  : `$${teamCreditsUsd}`
              }
            />
          </TokenSummary>
        </Card>
      </LayoutContent>
      <LayoutFooter>
        <Button
          onClick={() => {
            setState(FundState.SELECT_TEAM);
            setSelectedTeam(undefined);
            setLastFunding(undefined);
          }}
        >
          Fund More Teams
        </Button>
      </LayoutFooter>
    </>
  );
}
