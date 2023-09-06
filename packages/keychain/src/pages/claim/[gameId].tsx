import { useRouter } from "next/router";
import type { NextPage } from "next";
import { StarterPack } from "components";
import { useController } from "hooks/controller";

const ClaimStarterPack: NextPage = () => {
  const router = useRouter();
  const gameId = (router.query.gameId as string) || undefined;
  const [controller] = useController();

  return (
    <StarterPack
      starterPackId={gameId}
      controller={controller}
      onClaim={() => router.push(`/signup?sp=${gameId}`)}
    />
  );
};

export default ClaimStarterPack;
