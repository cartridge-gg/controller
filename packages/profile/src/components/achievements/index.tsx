import { useNavigate } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  Empty,
  Skeleton,
} from "@cartridge/ui-next";
import { useAccount } from "#hooks/account";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Trophies } from "./trophies";
import { useConnection, useData } from "#hooks/context";
import { useArcade } from "#hooks/arcade";
import { EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
import { addAddressPadding } from "starknet";
import { LayoutBottomNav } from "#components/bottom-nav";

export function Achievements() {
  const { address: self } = useAccount();
  const {
    trophies: { achievements, players, status },
    setAccountAddress,
  } = useData();

  const navigate = useNavigate();

  const { pins, games, editions } = useArcade();

  const { address } = useParams<{ address: string }>();
  const { project, namespace } = useConnection();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.namespace === namespace && edition.config.project === project,
    );
  }, [editions, project, namespace]);

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find((game) => game.id === edition?.gameId);
  }, [games, edition]);

  const pinneds = useMemo(() => {
    const ids = (
      pins[addAddressPadding(address || self || "0x0")] || []
    ).filter((id) => achievements.find((item) => item.id === id)?.completed);
    const pinneds = achievements
      .filter(
        (item) => item.completed && (ids.length === 0 || ids.includes(item.id)),
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    return pinneds;
  }, [achievements, pins, address, self]);

  const points = useMemo(() => {
    return (
      players.find((player) => player.address === (address || self))
        ?.earnings || 0
    );
  }, [address, self, players]);

  const isSelf = useMemo(() => {
    return !address || address === self;
  }, [address, self]);

  useEffect(() => {
    setAccountAddress(address || self || "");
  }, [address, self, setAccountAddress]);

  return (
    <LayoutContainer>
      <LayoutHeader
        variant="hidden"
        onBack={isSelf ? undefined : () => navigate(".")}
      />

      {achievements.length ? (
        <LayoutContent className="py-6 gap-y-6 select-none h-full">
          <Trophies
            achievements={achievements}
            pinneds={pinneds}
            softview={!isSelf}
            enabled={pinneds.length < 3}
            game={game}
            edition={edition}
            pins={pins}
            earnings={points}
          />
        </LayoutContent>
      ) : status === "loading" ? (
        <LayoutContent className="py-6 gap-y-4 select-none h-full overflow-hidden">
          <div className="flex justify-between">
            <Skeleton className="min-h-[136px] w-[120px] rounded" />
            <Skeleton className="min-h-[136px] w-[120px] rounded" />
            <Skeleton className="min-h-[136px] w-[120px] rounded" />
          </div>
          <Skeleton className="min-h-10 w-full rounded" />
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="min-h-[177px] w-full rounded" />
          ))}
        </LayoutContent>
      ) : (
        <LayoutContent className="select-none h-full">
          <Empty
            title="No achievements exist for this game."
            icon="achievement"
            className="h-full"
          />
        </LayoutContent>
      )}

      {isSelf && <LayoutBottomNav />}
    </LayoutContainer>
  );
}
