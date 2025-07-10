import { useEffect, useState } from "react";
import { Funding } from "../funding";
import Controller from "@/utils/controller";
import { useLocation, useNavigate } from "react-router-dom";
import { useTeamsQuery } from "@cartridge/ui/utils/api/cartridge";
import { Teams } from "./teams";

enum FundState {
  SELECT_TEAM,
  FUND,
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

  useEffect(() => {
    if (!Controller.fromStore(import.meta.env.VITE_ORIGIN!)) {
      navigate(`/slot?returnTo=${encodeURIComponent(pathname)}`, {
        replace: true,
      });
    }
  }, [navigate, pathname]);

  const { data: teamsData, isLoading, error } = useTeamsQuery();

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
        onFundTeam={() => {
          setState(FundState.FUND);
        }}
      />
    );
  }

  if (state === FundState.FUND) {
    return (
      <Funding
        title="Fund Credits for Slot"
        onBack={() => setState(FundState.SELECT_TEAM)}
        isSlot
      />
    );
  }
}
