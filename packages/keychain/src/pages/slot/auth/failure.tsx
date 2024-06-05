import { Container, Banner } from "components/layout";
import { AlertIcon } from "@cartridge/ui";

export default function Consent() {
  return (
    <Container variant="connect" hideAccount>
      <Banner
        icon={<AlertIcon boxSize={9} />}
        title="Uh-oh something went wrong"
        description="If this problem persists swing by the Cartridge support channel on Discord"
      />
    </Container>
  );
};
