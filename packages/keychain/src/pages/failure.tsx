"use client";

import { Container } from "components/layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui";
import { Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { CARTRIDGE_DISCORD_LINK } from "const";

export default function Failure() {
  return (
    <Container
      variant="full"
      hideAccount
      icon={<AlertIcon boxSize={9} />}
      title="Uh-oh something went wrong"
      description={
        <>
          If this problem persists swing by the Cartridge
          <Text color="inherit">
            support channel on{" "}
            <Link
              as={NextLink}
              href={CARTRIDGE_DISCORD_LINK}
              isExternal
              color="link.blue"
              display="inline-flex"
              flexDir="row"
              columnGap="0.1rem"
              alignItems="center"
            >
              Discord
              <ExternalIcon />
            </Link>
          </Text>
        </>
      }
    />
  );
}
