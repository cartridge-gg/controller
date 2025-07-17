import {
  UsersIcon,
  SlotIcon,
  Button,
  LayoutFooter,
  LayoutContent,
  Spinner,
  BranchIcon,
  Badge,
  TokenSummary,
  TokenCard,
  Empty,
  HeaderInner,
} from "@cartridge/ui";
import { formatBalance } from "@/hooks/tokens";
import { useState } from "react";

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

interface TeamsProps {
  teams: Team[];
  isLoading: boolean;
  error: boolean;
  onFundTeam: (team: Team) => void;
}

export function Teams({ teams, isLoading, error, onFundTeam }: TeamsProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  if (selectedTeam) {
    return <TeamCard team={selectedTeam} onFundTeam={onFundTeam} />;
  }

  const sortedTeams = [...teams].sort(
    (a, b) => (b.credits || 0) - (a.credits || 0),
  );

  return (
    <>
      <HeaderInner title="Select Team to Fund" icon={<SlotIcon size="lg" />} />
      <LayoutContent className="pb-3 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 pb-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading teams</p>
            </div>
          ) : sortedTeams.length === 0 ? (
            <Empty
              icon="discover"
              title="Please create a team with Slot cli"
              className="h-full md:h-[420px]"
            />
          ) : (
            sortedTeams.map((team) => (
              <TokenSummary key={team.id} onClick={() => setSelectedTeam(team)}>
                <TokenCard
                  title={team.name}
                  image={<UsersIcon variant="solid" size="lg" />}
                  amount={`${team.deployments?.totalCount} Deployments`}
                  value={`$${formatBalance(BigInt(team.credits), 8, 2)}`}
                />
              </TokenSummary>
            ))
          )}
        </div>
      </LayoutContent>
    </>
  );
}

export const TeamCard = ({
  team,
  onFundTeam,
}: {
  team: Team;
  onFundTeam: (team: Team) => void;
}) => {
  const usdBalance = formatBalance(BigInt(team.credits), 8, 2);
  return (
    <>
      <HeaderInner
        icon={<UsersIcon variant="solid" size="lg" />}
        variant="compressed"
        title={team.name}
      />
      <LayoutContent className="pb-3">
        <TokenSummary>
          <TokenCard
            title={"USD"}
            image={"https://static.cartridge.gg/media/usd_icon.svg"}
            amount={`${usdBalance} USD`}
            value={`$${usdBalance}`}
            className={"pointer-events-none"}
          />
        </TokenSummary>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-foreground-400 text-xs font-medium">
              Deployments
            </h3>
            {team.deployments?.totalCount > 0 && (
              <Badge className="px-2 rounded-full text-foreground-300 text-xs">
                {team.deployments?.totalCount || 0} total
              </Badge>
            )}
          </div>
          {(team.deployments?.totalCount || 0) === 0 ? (
            <Empty
              icon="discover"
              title="No Deployments"
              className="h-[240px]"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {team.deployments?.edges?.map((edge, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center gap-2 bg-background-200 rounded-md p-3"
                >
                  <BranchIcon size="sm" />
                  <p className=" text-sm font-medium">{edge?.node?.project}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button className="w-full " onClick={() => onFundTeam(team)}>
          FUND TEAM
        </Button>
      </LayoutFooter>
    </>
  );
};
