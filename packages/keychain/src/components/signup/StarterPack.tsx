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
  Divider,
} from "@chakra-ui/react";
import {
  useAccountInfoQuery,
  useStarterPackQuery,
  useClaimStarterpackMutation,
} from "generated/graphql";
import Controller from "utils/controller";
import Container from "../Container";
import Footer from "../Footer";
import { remoteSvgIcon } from "utils/svg";
import BannerImage from "./BannerImage";

import { Error, ExecuteReply } from "@cartridge/controller";
import { addAddressPadding } from "starknet";
import { StarterPackCarousel } from "components/carousel/StarterPack";
import { Header } from "components/Header";
import Ellipses from "./Ellipses";
import { MediaViewer } from "./MediaViewer";
import { InfoIcon, OlmechIcon, SparklesDuoIcon } from "@cartridge/ui";

export type StarterItemProps = {
  name: string;
  description: string;
  amount: string;
  uri?: string;
  icon?: ReactNode;
};

export const ClaimSuccess = ({
  name,
  banner,
  media,
  url,
  fullPage,
}: {
  name: string;
  banner: string;
  media?: string;
  url: string;
  fullPage: boolean;
}) => {
  const domain = new URL(url);
  return (
    <>
      <Container position={fullPage ? "relative" : "fixed"}>
        <Header />
        <BannerImage imgSrc={banner} obscuredWidth="0px" />
        <VStack spacing="18px" pt="36px" pb="24px">
          {media ? (
            <MediaViewer src={media} height="400px" width="300px" />
          ) : (
            <Circle size="48px" bgColor="gray.700">
              <SparklesDuoIcon boxSize="30px" />
            </Circle>
          )}
          <Text fontWeight="bold" fontSize="17px">
            {`Your ${name} Starter Pack is on the way!`}
          </Text>
          <Text fontSize="12px" color="whiteAlpha.600" textAlign="center">
            Checkout{" "}
            <Link href={url} variant="traditional" isExternal>
              {domain.hostname}
            </Link>{" "}
            to play on your desktop.
          </Text>
        </VStack>
      </Container>
    </>
  );
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

export const StarterPack = ({
  starterPackId,
  controller,
  fullPage = false,
  onClaim,
  onCancel,
}: {
  starterPackId: string;
  controller?: Controller;
  fullPage?: boolean;
  onClaim?: (res?: ExecuteReply) => void;
  onCancel?: (error: Error) => void;
}) => {
  const [remaining, setRemaining] = useState<number>();
  const [nonfungibles, setNonfungibles] = useState<StarterItemProps[]>([]);

  const {
    mutate: claimMutate,
    data: claimData,
    error: claimError,
    isLoading: claimLoading,
  } = useClaimStarterpackMutation();

  const {
    data: starterData,
    error: starterError,
    isLoading: starterLoading,
  } = useStarterPackQuery({
    id: starterPackId,
  });

  const { data: accountData, isLoading: accountLoading } = useAccountInfoQuery(
    {
      address: addAddressPadding(controller?.address),
    },
    { enabled: !!controller },
  );

  useEffect(() => {
    if (starterData) {
      let nft: StarterItemProps[] =
        starterData.game.starterPack.starterPackTokens.map((data) => ({
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
        icon: <OlmechIcon boxSize="38px" />,
        amount: "1",
      });

      setNonfungibles(nft);

      const { maxIssuance, issuance } = starterData.game.starterPack;
      setRemaining(maxIssuance - issuance);
    }
  }, [setNonfungibles, setRemaining, starterData]);

  if (!starterData) {
    return <></>;
  }

  if (claimData) {
    // hardcode briq for now
    const media =
      starterData?.game.name === "Briq"
        ? "https://storage.googleapis.com/c7e-prod-static/media/briq_cartridge_poap_nft_paris_1_7x16x11.glb"
        : undefined;
    return (
      <ClaimSuccess
        name={starterData?.game.name}
        banner={starterData?.game.banner.uri}
        url={starterData?.game.socials.website}
        media={media}
        fullPage={fullPage}
      />
    );
  }

  return (
    <Container position={fullPage ? "relative" : "fixed"}>
      <Header />
      <BannerImage imgSrc={starterData?.game.banner.uri} obscuredWidth="0px" />
      {claimError && (
        // HACK: assuming error is "already claimed"
        <>
          <VStack spacing="18px" pt="36px" pb="24px">
            <Circle size="48px" bgColor="gray.700">
              <SparklesDuoIcon boxSize="30px" />
            </Circle>
            <Text fontWeight="bold" fontSize="17px">
              {"You've already claimed this Starterpack"}
            </Text>
            <Text fontSize="12px" color="whiteAlpha.600" textAlign="center">
              Thanks for participating!
            </Text>
          </VStack>
        </>
      )}

      {!claimData && !claimError && (
        <>
          <VStack spacing="18px" pt="36px" pb="24px">
            <HStack spacing="14px">
              <Circle size="48px" bgColor="gray.700">
                <SparklesDuoIcon boxSize="30px" />
              </Circle>
              <Ellipses />
              <Circle size="48px" bgColor="gray.700">
                {remoteSvgIcon(starterData?.game.icon.uri, "30px", "white")}
              </Circle>
            </HStack>
            <Text fontWeight="bold" fontSize="17px">
              Claim Starterpack
            </Text>
            <Text fontSize="12px" color="whiteAlpha.600" textAlign="center">
              You will receive the following items.
            </Text>
          </VStack>
          <VStack w="full" borderRadius="8px" overflow="hidden">
            {nonfungibles.length != 0 && (
              <StarterPackCarousel nonfungibles={nonfungibles} />
            )}
            <Spacer minHeight="10px" />
            <Divider bgColor="gray.400" />
            <HStack w="full" px="12px" fontSize="10px">
              <Text
                variant="ibm-upper-bold"
                color={remaining > 0 ? "green.400" : "red.200"}
              >
                {remaining} remaining
              </Text>
              <Spacer />
              <Text variant="ibm-upper-bold">FREE</Text>
            </HStack>
          </VStack>
          <Footer
            confirmText={remaining === 0 ? "OUT OF STOCK" : "CLAIM"}
            isDisabled={!!starterError || remaining === 0}
            isLoading={claimLoading || starterLoading || accountLoading}
            onConfirm={() => {
              if (controller) {
                claimMutate({
                  id: starterData.game?.starterPack?.id,
                  account: accountData.accounts.edges?.[0]?.node.id,
                });
                return;
              }

              onClaim();
            }}
            showCancel={false}
            floatBottom={!fullPage}
          />
        </>
      )}
    </Container>
  );
};
