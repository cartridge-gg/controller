import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTeamsQuery } from "@cartridge/ui/utils/api/cartridge";
import { Purchase } from "../purchase";
import { PurchaseType } from "@cartridge/ui/utils/api/cartridge";
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
} from "@cartridge/ui";
import { Team, Teams } from "./teams";
import { formatBalance } from "@/hooks/tokens";
import { useNavigation } from "@/context/navigation";

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

  const {
    data: teamsData,
    isLoading,
    error,
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
        .map((edge) => edge!.node!) || [],
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
    return (
      <Purchase
        title={`Fund ${selectedTeam?.name}`}
        type={PurchaseType.Credits}
        isSlot={true}
        teamId={selectedTeam?.id}
        // onBack={() => {
        //   setState(FundState.SELECT_TEAM);
        // }}
        onComplete={() => setState(FundState.SUCCESS)}
      />
    );
  }

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
            <TokenCard
              image={"https://static.cartridge.gg/media/usd_icon.svg"}
              title={"USD"}
              amount={`${formatBalance(BigInt(selectedTeam?.credits || 0), 8, 2)} USD`}
              value={`$${formatBalance(BigInt(selectedTeam?.credits || 0), 8, 2)}`}
            />
          </TokenSummary>
        </Card>
      </LayoutContent>
      <LayoutFooter>
        <Button
          onClick={() => {
            setState(FundState.SELECT_TEAM);
            setSelectedTeam(undefined);
          }}
        >
          Fund More Teams
        </Button>
      </LayoutFooter>
    </>
  );
}
