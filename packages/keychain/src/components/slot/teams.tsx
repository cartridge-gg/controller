import {
  UsersIcon,
  SlotIcon,
  Button,
  Card,
  CardHeader,
  CardTitle,
  LayoutFooter,
  LayoutContent,
  Spinner,
  TokenSummary,
  TokenCard,
  Empty,
  HeaderInner,
} from "@cartridge/controller-ui";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useFeeToken,
} from "@/hooks/tokens";

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
              <TokenSummary key={team.id} onClick={() => onFundTeam(team)}>
                <TokenCard
                  title={team.name}
                  image={<UsersIcon variant="solid" size="lg" />}
                  amount=""
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
  onBack,
}: {
  team: Team;
  onFundTeam: (team: Team) => void;
  onBack?: () => void;
}) => {
  const { token: feeToken } = useFeeToken();
  const usdBalance = formatBalance(BigInt(team.credits), 8, 2);
  const strkBalance = formatBalance(BigInt(team.strk || 0), 6, 2);
  const strkUsdValue = feeToken?.price
    ? convertTokenAmountToUSD(BigInt(team.strk || 0), 6, feeToken.price)
    : undefined;
  return (
    <>
      <HeaderInner
        icon={<UsersIcon variant="solid" size="lg" />}
        variant="compressed"
        title={team.name}
      />
      <LayoutContent className="pb-3">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case font-semibold text-xs">
              Balances
            </CardTitle>
          </CardHeader>
          <TokenSummary className="rounded-tl-none rounded-tr-none">
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
              value={strkUsdValue}
              className={"pointer-events-none"}
            />
          </TokenSummary>
        </Card>
      </LayoutContent>
      <LayoutFooter>
        <div className="flex gap-3">
          {onBack && (
            <Button variant="secondary" className="flex-1" onClick={onBack}>
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={() => onFundTeam(team)}>
            FUND TEAM
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
};
