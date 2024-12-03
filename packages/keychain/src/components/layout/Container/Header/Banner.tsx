import {
  VStack,
  Circle,
  Text,
  IconProps,
  Center,
  Flex,
  Image,
  useColorMode,
  Square,
  HStack,
  SpinnerProps,
} from "@chakra-ui/react";
import { useControllerTheme } from "hooks/theme";
import { useMemo } from "react";
import { useLayoutVariant } from "../";
import { TOP_BAR_HEIGHT } from "./TopBar";

export type BannerProps = {
  Icon?: React.ComponentType<IconProps | SpinnerProps>;
  icon?: React.ReactElement;
  title: string | React.ReactElement;
  description?: string | React.ReactElement;
};
export function Banner({ Icon, icon, title, description }: BannerProps) {
  const theme = useControllerTheme();
  const { colorMode } = useColorMode();
  const cover = useMemo(
    () =>
      typeof theme.cover === "string" ? theme.cover : theme.cover[colorMode],
    [theme, colorMode],
  );
  const variant = useLayoutVariant();

  switch (variant) {
    case "expanded":
      return (
        <VStack w="full" pb={6}>
          <VStack
            h={136}
            w="full"
            bg={`url('${cover}')`}
            bgSize="cover"
            bgPos="center"
            position="relative"
            mb={10}
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #161A17 100%)`,
              pointerEvents: "none",
            }}
          >
            <Center position="absolute" bottom={-ICON_OFFSET / 4} left={4}>
              <HStack w="full" gap={4} align="center">
                <Flex
                  position="relative"
                  h={`${ICON_SIZE}px`}
                  w={`${ICON_SIZE}px`}
                  minW={`${ICON_SIZE}px`}
                >
                  <Flex
                    position="absolute"
                    inset={0}
                    borderWidth={4}
                    borderColor="solid.bg"
                    borderRadius="lg"
                  />
                  <Flex
                    bg="darkGray.700"
                    borderRadius="lg"
                    h="100%"
                    w="100%"
                    justify="center"
                    alignItems="center"
                    overflow="hidden"
                  >
                    {!!Icon ? (
                      <Circle size="100%" bg="solid.primary">
                        <Icon boxSize="100%" />
                      </Circle>
                    ) : !!icon ? (
                      <Circle size="100%" bg="solid.primary">
                        {icon}
                      </Circle>
                    ) : (
                      <Image
                        src={theme.icon}
                        w="100%"
                        h="100%"
                        alt="Controller Icon"
                        objectFit="cover"
                      />
                    )}
                  </Flex>
                </Flex>

                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="lg" fontWeight="semibold">
                    {title}
                  </Text>

                  {description && (
                    <Text fontSize="sm" color="text.secondary">
                      {description}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Center>
          </VStack>
        </VStack>
      );
    case "compressed":
    default:
      return (
        <VStack w="full">
          <HStack
            h={TOP_BAR_HEIGHT / 4}
            w="full"
            bg={`url('${cover}')`}
            bgSize="cover"
            bgPos="center"
            pb={6}
          />

          <HStack w="full" p={4} gap={4} minW={0}>
            {!!Icon ? (
              <Square size="44px" bg="solid.primary" borderRadius="md">
                <Icon boxSize={8} />
              </Square>
            ) : !!icon ? (
              <Square size="44px" bg="solid.primary" borderRadius="md">
                {icon}
              </Square>
            ) : (
              <Image
                src={theme.icon}
                boxSize="44px"
                alt="Controller Icon"
                borderRadius="md"
              />
            )}

            <VStack w="full" align="stretch" gap={1} minW={0}>
              <Text
                w="full"
                fontSize="lg"
                fontWeight="semibold"
                noOfLines={1}
                textOverflow="ellipsis"
              >
                {title}
              </Text>

              {description && (
                <Text
                  w="full"
                  fontSize="xs"
                  color="text.secondary"
                  overflowWrap="break-word"
                >
                  {description}
                </Text>
              )}
            </VStack>
          </HStack>
        </VStack>
      );
  }
}

const ICON_SIZE = 80;
const ICON_OFFSET = 40;
