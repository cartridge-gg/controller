import { Text, Link, Circle, VStack } from "@chakra-ui/react";
import { Container } from "../Container";
import { BannerImage } from "./BannerImage";

import { MediaViewer } from "./MediaViewer";
import { SparklesDuoIcon } from "@cartridge/ui";

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
