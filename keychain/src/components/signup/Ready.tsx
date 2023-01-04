import { useLottie } from "lottie-react";
import { Flex, Box } from "@chakra-ui/react";

import startupAnimation from "../../lottie/startup.json";
import { useEffect } from "react";

export const Ready = ({
  playSound,
  onComplete,
}: {
  playSound: () => void;
  onComplete: () => void;
}) => {
  const { View: StartupAnimation, play: playAnimation } = useLottie({
    animationData: startupAnimation,
    loop: false,
    autoplay: false,
    onComplete: onComplete,
  });

  useEffect(() => {
    playSound();
    playAnimation();
  }, [playSound, playAnimation]);

  return (
    <Flex
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
      <Box w={["full", "full", "400px"]}>{StartupAnimation}</Box>
    </Flex>
  );
};
