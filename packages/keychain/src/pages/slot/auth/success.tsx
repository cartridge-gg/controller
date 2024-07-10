import { Container } from "components/layout";
import { SparklesDuoIcon } from "@cartridge/ui";
import dynamic from "next/dynamic";

function Success() {
  return (
    <Container
      variant="connect"
      hideAccount
      Icon={SparklesDuoIcon}
      title="Success!"
      description="Return to your terminal to continue"
    />
  );
}

export default dynamic(() => Promise.resolve(Success), { ssr: false });
