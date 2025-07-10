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
} from "@cartridge/ui";
import { creditsToUSD } from "@/hooks/tokens";
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

  return (
    <LayoutContainer className="pb-12 min-h-[600px]">
      <LayoutHeader
        title="Select Team to Fund"
        icon={<SlotIcon size="lg" />}
        onBack={() => {}}
      />

      {isLoading ? (
        <div className="h-[600px] flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <LayoutContent className="h-full">
          <div className="flex flex-col gap-4 h-full w-full">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Error loading teams</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground-300">No teams found</p>
              </div>
            ) : (
              teams.map((team) => (
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
                        ${creditsToUSD(team.credits || 0).toFixed(2)}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </LayoutContent>
      )}
    </LayoutContainer>
  );
}

const TeamCard = ({
  team,
  onFundTeam,
  onBack,
}: {
  team: Team;
  onFundTeam: (team: Team) => void;
  onBack: () => void;
}) => {
  return (
    <LayoutContainer className="min-h-[600px]">
      <LayoutHeader
        title={team.name || "Unknown Team"}
        icon={<SlotIcon size="lg" />}
        onBack={onBack}
      />
      <LayoutContent className="h-screen pb-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">$</span>
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-foreground font-medium text-sm">
                  USD
                </CardTitle>
                <p className="text-foreground-300 text-xs">
                  {team.credits || 0} USD
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-foreground font-bold text-sm">
                ${creditsToUSD(team.credits || 0).toFixed(2)}
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-4 h-full mt-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-foreground-400 text-xs font-medium">
              Deployments
            </h3>
            <Badge className="px-2 rounded-full text-foreground-400 text-xs">
              {team.deployments?.totalCount || 0} total
            </Badge>
          </div>
          {(team.deployments?.totalCount || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center h-full border border-dashed border-background-400 ">
              <p className="text-background-500 text-sm">No Deployments</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {team.deployments?.edges?.map((edge, index) => (
                <div className="flex flex-row items-center gap-2  bg-background-200 rounded-md p-3">
                  <BranchIcon size="sm" />
                  <p className=" text-sm font-medium">
                    {edge?.node?.project || `Project ${index + 1}`}
                  </p>
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
