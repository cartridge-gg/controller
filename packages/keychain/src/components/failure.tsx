import { Container } from "@/components/layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui-next";
import { Link as UILink, Text } from "@chakra-ui/react";
import { CARTRIDGE_DISCORD_LINK } from "@/const";
import { Link } from "react-router-dom";

export function Failure() {
  return (
    <Container
      variant="expanded"
      hideAccount
      icon={<AlertIcon size="lg" />}
      title="Uh-oh something went wrong"
      description={
        <>
          If this problem persists swing by the Cartridge
          <Text color="inherit">
            support channel on{" "}
            <UILink
              as={Link}
              href={CARTRIDGE_DISCORD_LINK}
              isExternal
              color="link.blue"
              display="inline-flex"
              flexDir="row"
              columnGap="0.1rem"
              alignItems="center"
            >
              Discord
              <ExternalIcon size="sm" />
            </UILink>
          </Text>
        </>
      }
    />
  );
}
