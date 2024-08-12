import { Container } from "components/layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui";
import { Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { CARTRIDGE_DISCORD_LINK } from "const";
import { useParams } from "next/navigation";

function Failure() {
  return (
    <Container
      variant="connect"
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

export default dynamic(() => Promise.resolve(Failure), { ssr: false });
