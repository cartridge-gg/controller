import { Container, Banner } from "components/layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui";
import { Link, Text } from "@chakra-ui/react";
import NextLink from "next/link"

export default function Consent() {
  return (
    <Container variant="connect" hideAccount>
      <Banner
        icon={<AlertIcon boxSize={9} />}
        title="Uh-oh something went wrong"
        description={
          <>
            If this problem persists swing by the Cartridge
            <Text color="inherit">
              support channel on{" "}
              <Link
                as={NextLink}
                href="https://discord.gg/cartridge"
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
    </Container>
  );
};
