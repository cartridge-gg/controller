import { Container } from "components/layout";
import { SparklesDuoIcon } from "@cartridge/ui";

export default function Consent() {
  return (
    <Container
      variant="connect" hideAccount
      Icon={SparklesDuoIcon}
      title="Success!"
      description="Return to your terminal to continue"
    />
  );
};
