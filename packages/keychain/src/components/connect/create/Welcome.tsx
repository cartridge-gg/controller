import { useEffect } from "react";
import { useConnection } from "@/hooks/connection";
import { useController } from "@/hooks/controller";
import { useRouteCompletion } from "@/hooks/route";
import {
  LayoutContent,
  LayoutFooter,
  AchievementPlayerBadge,
  useCSSCustomProperty,
  Button,
} from "@cartridge/controller-ui";
import Confetti from "react-confetti";

export function Welcome() {
  const { setOnModalClose } = useConnection();
  const handleCompletion = useRouteCompletion();
  const { controller } = useController();
  const username = controller?.username() ?? "";
  const primaryColor = useCSSCustomProperty("--primary-100").trim();

  useEffect(() => {
    setOnModalClose?.(handleCompletion);
  }, [handleCompletion, setOnModalClose]);

  return (
    <>
      <LayoutContent className="overflow-hidden items-center gap-1">
        <Confetti
          width={320}
          height={700}
          colors={primaryColor ? [primaryColor] : undefined}
          numberOfPieces={350}
          recycle={false}
          gravity={0.15}
          tweenDuration={4000}
          className="w-full h-full absolute top-0 left-0"
        />

        <div className="relative w-full h-full flex flex-col items-center justify-center gap-1 my-6">
          <div className="h-[100px] flex items-center">
            <AchievementPlayerBadge username={username} size="4xl" />
          </div>
          <div className="text-lg font-semibold">Hello {username}!</div>
          {/* <div className="text-foreground-300 text-sm">You're almost done!</div> */}
        </div>
      </LayoutContent>

      <LayoutFooter className="py-4">
        <Button className="w-full" onClick={handleCompletion}>
          Continue
        </Button>
      </LayoutFooter>
    </>
  );
}
