import { useEffect, useState } from "react";
import Controller from "@/utils/controller";
import { useLocation, useNavigate } from "react-router-dom";
import { useTeamsQuery } from "@cartridge/ui/utils/api/cartridge";
import { Purchase } from "../purchase";
import { PurchaseType } from "@/hooks/payments/crypto";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CheckIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  TokenCard,
  TokenSummary,
} from "@cartridge/ui";
import { Team, Teams } from "./teams";
import { formatBalance } from "@/hooks/tokens";

enum FundState {
  SELECT_TEAM,
  PURCHASE,
  SUCCESS,
}

export function Fund() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState<FundState>(FundState.SELECT_TEAM);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();

  useEffect(() => {
    if (!Controller.fromStore(import.meta.env.VITE_ORIGIN!)) {
      navigate(`/slot?returnTo=${encodeURIComponent(pathname)}`, {
        replace: true,
      });
    }
  }, [navigate, pathname]);

  const {
    data: teamsData,
    isLoading,
    error,
  } = useTeamsQuery(undefined, { refetchInterval: 1000 });

  const teams: Team[] =
    teamsData?.me?.teams?.edges
      ?.filter((edge) => edge?.node != null)
      .map((edge) => edge!.node!) || [];

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
        type={PurchaseType.CREDITS}
        isSlot={true}
        teamId={selectedTeam?.id}
        onBack={() => {
          setState(FundState.SELECT_TEAM);
        }}
        onComplete={() => setState(FundState.SUCCESS)}
      />
    );
  }

  return (
    <LayoutContainer className="min-h-[600px]">
      <LayoutHeader title="Purchase Complete" Icon={CheckIcon} />
      <LayoutContent>
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
    </LayoutContainer>
  );
}
