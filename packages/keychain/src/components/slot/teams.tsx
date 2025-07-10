import {
  LayoutContainer,
  LayoutHeader,
  Card,
  CardHeader,
  CardTitle,
  Thumbnail,
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
} from "@cartridge/ui";
import { formatBalance } from "@/hooks/tokens";
import { Team } from "./fund";
import { useState } from "react";

interface TeamsProps {
  teams: Team[];
  isLoading: boolean;
  error: boolean;
  onFundTeam: (team: Team) => void;
}

export function Teams({ teams, isLoading, error, onFundTeam }: TeamsProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  if (selectedTeam) {
    return (
      <TeamCard
        team={selectedTeam}
        onFundTeam={onFundTeam}
        onBack={() => setSelectedTeam(null)}
      />
    );
  }

  const sortedTeams = [...teams].sort(
    (a, b) => (b.credits || 0) - (a.credits || 0),
  );

  return (
    <LayoutContainer className="pb-12 min-h-[600px]">
      <LayoutHeader title="Select Team to Fund" icon={<SlotIcon size="lg" />} />
      <LayoutContent className="h-full">
        <div className="flex flex-col gap-4 h-full w-full">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading teams</p>
            </div>
          ) : sortedTeams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground-300 text-sm">
                Please first create a team with slot cli
              </p>
            </div>
          ) : (
            sortedTeams.map((team) => (
              <Card
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className="cursor-pointer"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center gap-3">
                    <Thumbnail
                      size="lg"
                      icon={<UsersIcon variant="solid" size="lg" />}
                      variant="light"
                    />
                    <div className="flex flex-col">
                      <CardTitle className="text-foreground font-medium text-sm">
                        {team.name || "Unknown Team"}
                      </CardTitle>
                      <p className="text-foreground-300 text-xs">
                        {team.deployments?.totalCount || 0} Deployments
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-bold text-sm">
                      ${formatBalance(BigInt(team.credits), 8, 2)}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </LayoutContent>
    </LayoutContainer>
  );
}

export const TeamCard = ({
  team,
  onFundTeam,
  onBack,
}: {
  team: Team;
  onFundTeam: (team: Team) => void;
  onBack: () => void;
}) => {
  const usdBalance = formatBalance(BigInt(team.credits), 8, 2);
  return (
    <LayoutContainer className="min-h-[600px]">
      <LayoutHeader
        title={team.name || "Unknown Team"}
        icon={<UsersIcon variant="solid" size="lg" />}
        onBack={onBack}
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
              <Badge className="px-2 rounded-full text-foreground-400 text-xs">
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
    </LayoutContainer>
  );
};
