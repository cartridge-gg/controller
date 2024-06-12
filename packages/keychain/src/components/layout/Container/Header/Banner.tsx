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
} from "@chakra-ui/react";
import { useControllerTheme } from "hooks/theme";
import { useMemo } from "react";
import { useLayoutVariant } from "../";
import { TOP_BAR_HEIGHT } from "./TopBar";

export type BannerProps = {
  Icon?: React.ComponentType<IconProps>;
  icon?: React.ReactElement;
  title: string;
  description?: string | React.ReactElement;
}
export function Banner({
  Icon,
  icon,
  title,
  description,
}: BannerProps) {
  const theme = useControllerTheme();
  const { colorMode } = useColorMode();
  const cover = useMemo(
    () =>
      typeof theme.cover === "string" ? theme.cover : theme.cover[colorMode],
    [theme, colorMode],
  );
  const variant = useLayoutVariant();

  switch (variant) {
    case "connect":
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
          >
            <Center
              position="absolute"
              bottom={-ICON_OFFSET / 4}
              left={0}
              right={0}
            >
              <Flex
                bg="darkGray.700"
                borderRadius="lg"
                h={`${ICON_SIZE}px`}
                w={`${ICON_SIZE}px`}
                justify="center"
                alignItems="center"
                borderWidth={4}
                borderColor="solid.bg"
              >
                {!!Icon ? (
                  <Circle size={ICON_IMAGE_SIZE / 4} bg="solid.primary">
                    <Icon boxSize={8} />
                  </Circle>
                ) : !!icon ? (
                  <Circle size={ICON_IMAGE_SIZE / 4} bg="solid.primary">
                    {icon}
                  </Circle>
                ) : (
                  <Image
                    src={theme.icon}
                    boxSize={ICON_IMAGE_SIZE / 4}
                    alt="Controller Icon"
                  />
                )}
              </Flex>
            </Center>
          </VStack>

          <VStack px={4} w="full">
            <Text fontSize="lg" fontWeight="semibold" whiteSpace="nowrap">
              {title}
            </Text>

            {description && (
              <Text fontSize="sm" color="text.secondary" align="center">
                {description}
              </Text>
            )}
          </VStack>
        </VStack>

      )
    default:
      return (
        <VStack w="full">
          <HStack
            h={TOP_BAR_HEIGHT}
            w="full"
            bg={`url('${cover}')`}
            bgSize="cover"
            bgPos="center"
            pb={6}
          />

          <HStack w="full" p={4} gap={4}>
            {!!Icon ? (
              <Square size="44px" bg="solid.primary">
                <Icon boxSize={8} />
              </Square>
            ) : !!icon ? (
              <Square size="44px" bg="solid.primary">
                {icon}
              </Square>
            ) : (
              <Image
                src={theme.icon}
                boxSize={11}
                alt="Controller Icon"
              />
            )}

            <VStack align="flex-start" gap={1}>
              <Text fontSize="lg" fontWeight="semibold" whiteSpace="nowrap">
                {title}
              </Text>

              {description && (
                <Text fontSize="xs" color="text.secondary" whiteSpace="nowrap">
                  {description}
                </Text>
              )}
            </VStack>
          </HStack>
        </VStack >
      )
  }

}

const ICON_IMAGE_SIZE = 64;
const ICON_SIZE = 80;
const ICON_OFFSET = 32;
