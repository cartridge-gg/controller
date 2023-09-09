import { NextPage } from "next";
import { Container, PortalBanner } from "components";
import { SparklesDuoIcon } from "@cartridge/ui/lib";

const Consent: NextPage = () => {
  return (
    <Container hideAccount>
      <PortalBanner
        Icon={SparklesDuoIcon}
        title="Success!"
        description="Return to your terminal to continue"
      />
    </Container>
  );
};

export default Consent;
