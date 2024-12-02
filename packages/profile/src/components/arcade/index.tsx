import {
  ControllerIcon,
  SpaceInvaderIcon,
  CopyAddress,
} from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { LayoutContent, LayoutHeader } from "../layout";
import { useAccount } from "@/hooks/account";
import { Games } from "./games";

export const Header = () => {
  const { username } = useAccount();

  return (
    <div className="flex justify-between gap-x-px w-full">
      <div className="bg-background h-14 w-14 flex items-center justify-center">
        <ControllerIcon className="h-6 w-6 text-primary" size={"xs"} />
      </div>
      <div className="bg-background flex justify-end items-center grow px-3 py-2">
        <div className="bg-secondary flex items-center px-2 py-1.5 rounded-md">
          <div className="h-7 w-7 flex items-center justify-center">
            <SpaceInvaderIcon className="h-4 w-4" size="xs" variant="solid" />
          </div>
          <p className="text-sm font-semibold px-1">{username || "Connect"}</p>
        </div>
      </div>
    </div>
  );
};

export const Content = () => {
  return (
    <LayoutContent className="flex flex-row justify-between items-center">
      <Games />
      <Container />
    </LayoutContent>
  );
};

export const Player = () => {
  const { username, address } = useAccount();

  return (
    <LayoutHeader
      title={username}
      description={<CopyAddress address={address} size="sm" />}
      right={<Navigation />}
    />
  );
};

export const Container = () => {
  return <div className="">Container</div>;
};

export const Arcade = () => {
  return (
    <div className="bg-spacer flex flex-col items-center gap-y-px select-none">
      <Header />
      <div className="bg-background w-full flex justify-center">
        <div className="w-3/4 flex flex-col py-8 gap-y-8">
          <Player />
          <Content />
        </div>
      </div>
    </div>
  );
};
