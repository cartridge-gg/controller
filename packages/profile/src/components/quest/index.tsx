import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import {
  BookIcon,
  DoveIcon,
  ScrollArea,
} from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab } from "./tab";
import { useConnection } from "@/hooks/context";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { useState } from "react";
import { Pinned, Empty } from "./pinned";
import { Achievements } from "./achievements";

export function Quest() {
  const { username, address } = useConnection();
  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">("trophies");

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      <LayoutContent>
        <div className="flex justify-between gap-4">
          <TrophiesTab active={activeTab === "trophies"} onClick={() => setActiveTab("trophies")} />
          <LeaderboardTab active={activeTab === "leaderboard"} onClick={() => setActiveTab("leaderboard")} />
        </div>
        <ScrollArea className="overflow-auto">
          <div className="flex flex-col h-full flex-1 overflow-y-auto gap-4 pb-4">
            <div className="grid grid-cols-3 gap-4">
              <Pinned Icon={BookIcon} title={"rogue Scholar"} />
              <Pinned Icon={DoveIcon} title={"Lorem ipsum dolor sit amet"} />
              <Empty />
            </div>
            <Achievements />
          </div>
        </ScrollArea>
      </LayoutContent>
    </LayoutContainer>
  );
}