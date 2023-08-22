import { useRouter } from "next/router";
import type { NextPage } from "next";
import { StarterPack } from "components";
import { useMemo } from "react";
import Controller from "utils/controller";

const ClaimStarterPack: NextPage = () => {
  const router = useRouter();
  const gameId = (router.query.gameId as string) || undefined;
  const controller = useMemo(() => Controller.fromStore(), []);

  return (
    <StarterPack
      starterPackId={gameId}
      controller={controller}
      onClaim={() => router.push(`/signup?sp=${gameId}`)}
      fullPage
    />
  );
};

export default ClaimStarterPack;
