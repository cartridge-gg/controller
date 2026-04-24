import {
  UsersIcon,
  SlotIcon,
  Button,
  LayoutFooter,
  LayoutContent,
  Spinner,
  TokenSummary,
  TokenCard,
  Empty,
  HeaderInner,
} from "@cartridge/controller-ui";
import { formatBalance } from "@/hooks/tokens";
import { useState } from "react";

export interface Team {
  id: string;
  name: string;
  credits: number;
  strk: number;
}

const STRK_ICON =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo";

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
                  amount={`${formatBalance(BigInt(team.credits), 8, 2)} USD`}
                  value={`${formatBalance(BigInt(team.strk || 0), 6, 2)} STRK`}
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
  const strkBalance = formatBalance(BigInt(team.strk || 0), 6, 2);
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
          <TokenCard
            title={"STRK"}
            image={STRK_ICON}
            amount={`${strkBalance} STRK`}
            className={"pointer-events-none"}
          />
        </TokenSummary>
      </LayoutContent>
      <LayoutFooter>
        <Button className="w-full " onClick={() => onFundTeam(team)}>
          FUND TEAM
        </Button>
      </LayoutFooter>
    </>
  );
};
