import { useCallback, useEffect, useState } from "react";
import Image from "next/future/image";
import {
  Text,
  Link,
  VStack,
  Circle,
  HStack,
  Spacer,
  Divider,
  Button,
} from "@chakra-ui/react";
import {
  useAccountInfoQuery,
  useStarterPackQuery,
  useClaimStarterpackMutation,
} from "generated/graphql";
import Controller from "utils/controller";
import { Container } from "../../Container";
import { ExecuteReply } from "@cartridge/controller";
import { addAddressPadding } from "starknet";
import { OlmechIcon, SparklesDuoIcon } from "@cartridge/ui";
import { BannerImage } from "../BannerImage";
import { MediaViewer } from "../MediaViewer";
import Ellipses from "components/legacy/signup/Ellipses";
import { remoteSvgIcon } from "utils/svg";
import { StarterPackCarousel } from "./Carousel";
import { PortalFooter } from "components/PortalFooter";

export function ClaimSuccess({
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
}) {
  const domain = new URL(url);
  return (
    <>
      <Container fullPage={fullPage}>
        <BannerImage imgSrc={banner} />
        <VStack spacing={4} pt={9} pb={6}>
          {media ? (
            <MediaViewer
              src={media}
              alt="Claimed starter pack"
              height="400px"
              width="300px"
            />
          ) : (
            <Circle size={12}>
              <SparklesDuoIcon boxSize={8} />
            </Circle>
          )}
          <Text fontWeight="bold" fontSize="lg">
            {`Your ${name} Starter Pack is on the way!`}
          </Text>

          <Text fontSize="xm" textAlign="center">
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
}

export function StarterPack({
  starterPackId,
  controller,
  fullPage = false,
  onClaim,
}: {
  starterPackId: string;
  controller?: Controller;
  fullPage?: boolean;
  onClaim?: (res?: ExecuteReply) => void;
}) {
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

  const onSubmit = useCallback(() => {
    if (controller) {
      claimMutate({
        id: starterData?.game?.starterPack?.id,
        account: accountData?.accounts.edges?.[0]?.node.id,
      });
      return;
    }

    onClaim();
  }, [
    accountData?.accounts.edges,
    claimMutate,
    controller,
    onClaim,
    starterData?.game?.starterPack?.id,
  ]);

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
    <Container fullPage={fullPage}>
      <BannerImage imgSrc={starterData?.game.banner.uri} />

      {claimError && (
        // HACK: assuming error is "already claimed"
        <>
          <VStack spacing={4.5} pt={9} pb={6}>
            <Circle size={12} bg="solid.primary">
              <SparklesDuoIcon boxSize={8} />
            </Circle>

            <Text fontWeight="bold" fontSize="lg">
              {"You've already claimed this Starterpack"}
            </Text>

            <Text fontSize="sm" color="translucent.lg" textAlign="center">
              Thanks for participating!
            </Text>
          </VStack>
        </>
      )}

      {!claimData && !claimError && (
        <>
          <VStack spacing={4.5} pt={9} pb={6}>
            <HStack spacing={3.5}>
              <Circle size={12} bgColor="solid.primary">
                <SparklesDuoIcon boxSize={8} />
              </Circle>
              <Ellipses />
              <Circle size={12} bgColor="solid.primary">
                {remoteSvgIcon(starterData?.game.icon.uri, "30px", "white")}
              </Circle>
            </HStack>
            <Text fontWeight="bold" fontSize="lg">
              Claim Starterpack
            </Text>
            <Text fontSize="sm" color="translucent.lg" textAlign="center">
              You will receive the following items.
            </Text>
          </VStack>
          <VStack w="full" borderRadius="sm" overflow="hidden">
            {nonfungibles.length != 0 && (
              <StarterPackCarousel nonfungibles={nonfungibles} />
            )}
            <Spacer minHeight="10px" />
            <Divider bgColor="solid.spacer" />
            <HStack w="full" px="12px" fontSize="10px">
              <Text color={remaining > 0 ? "green.400" : "red.200"}>
                {remaining} remaining
              </Text>
              <Spacer />
              <Text>FREE</Text>
            </HStack>
          </VStack>

          <PortalFooter fullPage={fullPage}>
            <Button
              colorScheme="colorful"
              onClick={onSubmit}
              isDisabled={!!starterError || remaining === 0}
              isLoading={claimLoading || starterLoading || accountLoading}
            >
              {remaining === 0 ? "OUT OF STOCK" : "CLAIM"}
            </Button>
          </PortalFooter>
        </>
      )}
    </Container>
  );
}

export type StarterItemProps = {
  name: string;
  description: string;
  amount: string;
  uri?: string;
  icon?: React.ReactNode;
};
