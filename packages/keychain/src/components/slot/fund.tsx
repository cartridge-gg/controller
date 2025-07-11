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
import { Teams } from "./teams";
import { formatBalance } from "@/hooks/tokens";

enum FundState {
  SELECT_TEAM,
  PURCHASE,
  SUCCESS,
}

export interface Team {
  id: string;
  name: string;
  credits: number;
  deployments: {
    totalCount: number;
    edges?:
      | ({
          node?: {
            project: string;
          } | null;
        } | null)[]
      | null;
  };
}

export function Fund() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState<FundState>(FundState.SELECT_TEAM);
  const [team, setTeam] = useState<Team>();

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

  if (state === FundState.SELECT_TEAM) {
    return (
      <Teams
        teams={teams}
        isLoading={isLoading}
        error={!!error}
        onFundTeam={(team) => {
          setState(FundState.PURCHASE);
          setTeam(team);
        }}
      />
    );
  }

  if (state === FundState.PURCHASE) {
    return (
      <Purchase
        title={`Fund ${team?.name}`}
        type={PurchaseType.CREDITS}
        isSlot={true}
        teamId={team?.id}
        onBack={() => setState(FundState.SELECT_TEAM)}
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
              {`Funded ${team?.name}`}
            </CardTitle>
          </CardHeader>
          <TokenSummary className="rounded-tl-none rounded-tr-none">
            <TokenCard
              image={"https://static.cartridge.gg/media/usd_icon.svg"}
              title={"USD"}
              amount={`${formatBalance(BigInt(team?.credits || 0), 8, 2)} USD`}
              value={`$${formatBalance(BigInt(team?.credits || 0), 8, 2)}`}
            />
          </TokenSummary>
        </Card>
      </LayoutContent>
      <LayoutFooter>
        <Button onClick={() => setState(FundState.SELECT_TEAM)}>
          Fund More Teams
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
