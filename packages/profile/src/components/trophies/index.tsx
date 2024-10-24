import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { Link } from "react-router-dom";
import {
  ScrollArea,
  StateIconProps,
  Button,
  ArrowIcon,
} from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab, Scoreboard } from "./tab";
import { useAccount } from "@/hooks/context";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Achievements } from "./achievements";
import { Pinneds } from "./pinneds";
import { Leaderboard } from "./leaderboard";
import { items, players } from "./data";
import {
  AccountNameQuery,
  useAccountNameQuery,
} from "@cartridge/utils/api/cartridge";
import {
  useEventsQuery,
} from "@cartridge/utils/api/indexer";
import { hash, byteArray, ByteArray } from "starknet";


// Computes dojo selector from namespace and event name
export function getSelectorFromTag(namespace: string, event: string): string {
  return hash.computePoseidonHashOnElements([computeByteArrayHash(namespace), computeByteArrayHash(event)]);
}

// Serializes a ByteArray to a bigint array
function serializeByteArray(byteArray: ByteArray): bigint[] {
  const result: bigint[] = [
    BigInt(byteArray.data.length),
    ...byteArray.data.map((word) => BigInt(word.toString())),
    BigInt(byteArray.pending_word),
    BigInt(byteArray.pending_word_len),
  ];
  return result;
}

// Poseidon hash of a string representated as a ByteArray
export function computeByteArrayHash(str: string): string {
    const bytes = byteArray.byteArrayFromString(str);
    return hash.computePoseidonHashOnElements(serializeByteArray(bytes));
}

export interface Item {
  id: string;
  title: string;
  hidden_title: string;
  description: string;
  hidden_description: string;
  percentage: number;
  earning: number;
  timestamp: number;
  completed: boolean;
  hidden: boolean;
  pinned: boolean;
  Icon: React.ComponentType<StateIconProps> | undefined;
}

export interface Player {
  username: string;
  address: string;
  earnings: number;
  rank: number;
  Icon: React.ComponentType<StateIconProps> | undefined;
}

export function Trophies() {
  const { address: self } = useAccount();
  const { address } = useParams<{ address: string }>();
  const [username, setUsername] = useState<string>("");
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">(
    "trophies",
  );

  const { pinneds, completed, total } = useMemo(() => {
    const pinneds = achievements.filter((item) => item.pinned).slice(0, 3);
    const completed = achievements.filter((item) => item.completed).length;
    const total = achievements.length;
    return { pinneds, completed, total };
  }, [achievements]);

  const { rank, earnings } = useMemo(() => {
    const rank =
      players.findIndex((player) => player.address === (address || self)) + 1;
    const earnings =
      players.find((player) => player.address === (address || self))
        ?.earnings || 0;
    return { rank, earnings };
  }, [address, self]);

  const isSelf = useMemo(() => {
    return !address || address === self;
  }, [address, self]);

  useEffect(() => {
    const achievements = items;
    setAchievements(achievements);
  }, []);

  const onPin = useCallback(
    (id: string) => {
      const updated = achievements.map((item) => ({
        ...item,
        pinned: item.id === id ? !item.pinned : item.pinned,
      }));
      setAchievements(updated);
    },
    [achievements],
  );

  const { refetch: fetchName } = useAccountNameQuery(
    { address: address || self },
    {
      enabled: false,
      onSuccess: async (data: AccountNameQuery) => {
        setUsername(data.accounts?.edges?.[0]?.node?.id ?? "Anonymous");
      },
    },
  );

  const { refetch: fetchAchievementCreations } = useEventsQuery(
    { keys: [getSelectorFromTag("conquest", "AchievementCreation")], limit: 100, offset: 0 },
    {
      enabled: false,
      onSuccess: (data) => {
        console.log('creations', data);
      },
    }
  );

  const { refetch: fetchAchievementCompletions } = useEventsQuery(
    { keys: [getSelectorFromTag("conquest", "AchievementCompletion")], limit: 100, offset: 0 },
    {
      enabled: false,
      onSuccess: (data) => {
        console.log('completions', data);
      },
    }
  );

  useEffect(() => {
    fetchName();
    fetchAchievementCreations();
    fetchAchievementCompletions();
  }, [fetchName, fetchAchievementCreations, fetchAchievementCompletions, address]);

  return (
    <LayoutContainer
      left={
        !isSelf ? (
          <Link to="/trophies">
            <Button variant="icon" size="icon">
              <ArrowIcon variant="left" />
            </Button>
          </Link>
        ) : undefined
      }
    >
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address || self} size="sm" />}
        right={
          isSelf ? (
            <Navigation />
          ) : (
            <Scoreboard rank={rank} earnings={earnings} />
          )
        }
      />

      {items.length ? (
        <LayoutContent className="pb-4">
          {isSelf && (
            <div className="flex justify-between gap-4">
              <TrophiesTab
                active={activeTab === "trophies"}
                completed={completed}
                total={total}
                onClick={() => setActiveTab("trophies")}
              />
              <LeaderboardTab
                active={activeTab === "leaderboard"}
                rank={rank}
                earnings={earnings}
                onClick={() => setActiveTab("leaderboard")}
              />
            </div>
          )}
          {(!isSelf || activeTab === "trophies") && (
            <ScrollArea className="overflow-auto">
              <div className="flex flex-col h-full flex-1 overflow-y-auto gap-4">
                <Pinneds achievements={pinneds} />
                <Achievements
                  achievements={achievements}
                  softview={!isSelf}
                  enabled={pinneds.length < 3}
                  onPin={onPin}
                />
              </div>
            </ScrollArea>
          )}
          {isSelf && activeTab === "leaderboard" && (
            <ScrollArea className="overflow-auto">
              <Leaderboard players={players} address={self} />
            </ScrollArea>
          )}
        </LayoutContent>
      ) : (
        <LayoutContent className="pb-4">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <p className="text-muted-foreground/30">No trophies available</p>
          </div>
        </LayoutContent>
      )}
    </LayoutContainer>
  );
}
