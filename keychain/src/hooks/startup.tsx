import { Box, Flex } from "@chakra-ui/react";
import startupAnimation from "../lottie/startup.json";
import { useLottie } from "lottie-react";
import useSound from "use-sound";
import { ReactElement, useCallback, useState } from "react";

export const useStartup = ({
  onComplete,
}: {
  onComplete: () => void;
}): { play: () => void; StartupAnimation: ReactElement } => {
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
    StartupAnimation: <StartupAnimation show={isPlaying} View={View} />,
  };
};

const StartupAnimation = ({
  show,
  View,
}: {
  show: boolean;
  View: ReactElement;
}) => {
  return (
    <Flex
      display={show ? "flex" : "none"}
      position="fixed"
      align="center"
      justify="center"
      top="0"
      left="0"
      h="100vh"
      w="100vw"
      bgColor="gray.900"
      zIndex="overlay"
    >
      <Box w={["full", "full", "400px"]}>{View}</Box>
    </Flex>
  );
};
