import { ReactNode, useEffect, useState } from "react";
import Image from "next/future/image";
import {
  Box,
  Text,
  Flex,
  Link,
  VStack,
  HStack,
  Tooltip,
  Spacer,
  Circle,
  SystemProps,
} from "@chakra-ui/react";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import CoinIcon from "@cartridge/ui/src/components/icons/Coin";
import { StarterPackCarousel } from "components/carousel/StarterPack";
import OlmecIcon from "@cartridge/ui/src/components/icons/Olmec";

export type StarterItemProps = {
  name: string;
  description: string;
  amount: string;
  uri?: string;
  icon?: ReactNode;
};

export const StarterItem = ({
  name,
  description,
  amount,
  icon,
  ...rest
}: StarterItemProps & SystemProps) => (
  <HStack
    px="16px"
    py="8px"
    w="full"
    bgColor="gray.700"
    fontSize="14px"
    color="gray.200"
    {...rest}
  >
    {icon}
    <Text color="inherit">{name || "unknown"}</Text>
    {description && (
      <Tooltip placement="bottom" hasArrow label={description} mt="10px">
        <Link>
          <InfoIcon _hover={{ cursor: "pointer" }} />
        </Link>
      </Tooltip>
    )}
    <Spacer />
    <Text color="inherit">{amount}</Text>
  </HStack>
);

export type StarterPackProps = {
  starterpack: any;
  gameIcon: ReactNode;
};

export const StarterPack = ({ starterpack, gameIcon }: StarterPackProps) => {
  const [nonfungibles, setNonfungibles] = useState<StarterItemProps[]>([]);
  let remaining = starterpack.maxIssuance - starterpack.issuance;
  remaining = remaining < 0 ? 0 : remaining;
  useEffect(() => {
    let nft: StarterItemProps[] =
      starterpack.starterPackTokens.map((data) => ({
        name: data.token.metadata.name,
        description: data.token.metadata.description,
        icon: (
          <Image
            alt={data.token.metadata.name}
            src={data.token.thumbnail.uri}
            fill
          />
        ),
        amount: data.amount,
      })) || [];

    nft.push({
      name: "CARTRIDGE OL-MECH",
      description:
        "This is your digital fingerprint in the cartridge ecosystem. It will evolve as you play.",
      icon: <OlmecIcon boxSize="38px" />,
      amount: "1",
    });

    setNonfungibles(nft);
  }, [setNonfungibles, starterpack]);

  return (
    <VStack borderRadius="8" overflow="hidden" spacing="1px" w="full">
      <Flex
        w="full"
        h="60px"
        px="20px"
        py="22px"
        align="center"
        bgColor="gray.600"
        color="green.400"
      >
        <HStack>
          {gameIcon}
          <Text
            as="strong"
            variant="ld-mono-upper"
            fontSize="12px"
            color="inherit"
          >
            {starterpack.name}
          </Text>
        </HStack>

        <Spacer />
        <Box borderRadius="full" bgColor="whiteAlpha.200" px="12px" py="6px">
          <Text fontSize="9px" letterSpacing="0.05em" fontWeight="bold">
            {remaining} remaining
          </Text>
        </Box>
      </Flex>
      {nonfungibles.length != 0 && (
        <StarterPackCarousel nonfungibles={nonfungibles} />
      )}
    </VStack>
  );
};
