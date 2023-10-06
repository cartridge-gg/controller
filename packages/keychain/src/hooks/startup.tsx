import startupAnimation from "../lottie/startup.json";
import { useLottie } from "lottie-react";
import useSound from "use-sound";
import { ReactElement, useCallback, useState } from "react";
import { FullPageAnimation } from "components";

export function useStartup({ onComplete }: { onComplete?: () => void }): {
  play: () => void;
  StartupAnimation: ReactElement;
} {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSound] = useSound(
    "https://static.cartridge.gg/sounds/startup.mp3",
  );

  const { View, play: playAnimation } = useLottie({
    animationData: startupAnimation,
    loop: false,
    autoplay: false,
    onComplete: onComplete,
  });

  const play = useCallback(() => {
    setIsPlaying(true);
    playSound();
    playAnimation();
  }, [setIsPlaying, playSound, playAnimation]);

  return {
    play,
    StartupAnimation: <FullPageAnimation show={isPlaying} View={View} />,
  };
}
