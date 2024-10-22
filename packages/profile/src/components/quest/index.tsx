import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import {
  BoltIcon,
  BookIcon,
  DoveIcon,
  ScrollArea,
  StateIconProps,
} from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab } from "./tab";
import { useConnection } from "@/hooks/context";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { useState } from "react";
import { Achievements } from "./achievements";
import { Pinneds } from "./pinneds";

export interface Item {
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

export function Quest() {
  const { username, address } = useConnection();
  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">(
    "trophies",
  );

  const achivements: Item[] = [
    {
      title: "pacifist path",
      hidden_title: "hidden trophy",
      description: "finish a run without killing any monsters",
      hidden_description: "",
      percentage: 24,
      earning: 50,
      timestamp: 1729328800,
      completed: true,
      hidden: false,
      pinned: true,
      Icon: DoveIcon,
    },
    {
      title: "rogue scholar",
      hidden_title: "hidden trophy",
      description: "lorem ipsum dolor sit amet",
      hidden_description: "",
      percentage: 12,
      earning: 10000,
      timestamp: 1729527062,
      completed: true,
      hidden: false,
      pinned: true,
      Icon: BookIcon,
    },
    {
      title: "speed runner",
      hidden_title: "hidden trophy",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      hidden_description: "",
      percentage: 12,
      earning: 1,
      timestamp: 1729433462,
      completed: true,
      hidden: false,
      pinned: false,
      Icon: undefined,
    },
    {
      title: "Lightning Reflexes",
      hidden_title: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      hidden_description: "",
      percentage: 12,
      earning: 100,
      timestamp: 0,
      completed: false,
      hidden: false,
      pinned: false,
      Icon: BoltIcon,
    },
    {
      title: "",
      hidden_title: "hidden trophy",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      hidden_description: "",
      percentage: 6,
      earning: 100,
      timestamp: 0,
      completed: false,
      hidden: true,
      pinned: false,
      Icon: undefined,
    },
    {
      title: "",
      hidden_title: "hidden trophy",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      hidden_description: "",
      percentage: 42,
      earning: 100,
      timestamp: 0,
      completed: false,
      hidden: true,
      pinned: false,
      Icon: undefined,
    },
    {
      title: "",
      hidden_title: "hidden trophy",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      hidden_description: "This is an hidden description for an hidden trophy",
      percentage: 12,
      earning: 100,
      timestamp: 0,
      completed: false,
      hidden: true,
      pinned: false,
      Icon: undefined,
    },
    {
      title: "",
      hidden_title: "hidden trophy",
      description: "",
      hidden_description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      percentage: 21,
      earning: 100,
      timestamp: 0,
      completed: false,
      hidden: true,
      pinned: false,
      Icon: undefined,
    },
  ];

  const pinneds = achivements.filter((item) => item.pinned).slice(0, 3);

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      <LayoutContent>
        <div className="flex justify-between gap-4">
          <TrophiesTab
            active={activeTab === "trophies"}
            onClick={() => setActiveTab("trophies")}
          />
          <LeaderboardTab
            active={activeTab === "leaderboard"}
            onClick={() => setActiveTab("leaderboard")}
          />
        </div>
        <ScrollArea className="overflow-auto">
          <div className="flex flex-col h-full flex-1 overflow-y-auto gap-4 mb-4">
            <Pinneds achievements={pinneds} />
            <Achievements achievements={achivements} />
          </div>
        </ScrollArea>
      </LayoutContent>
    </LayoutContainer>
  );
}
