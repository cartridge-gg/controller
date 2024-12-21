import { Container } from "@/components/layout";
import { SparklesDuoIcon } from "@cartridge/ui-next";
import { useSearchParams } from "react-router-dom";

export function Success() {
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const description = searchParams.get("description");

  return (
    <Container
      variant="expanded"
      hideAccount
      Icon={SparklesDuoIcon}
      title={title ? (title as string) : "Success!"}
      description={description ? (description as string) : ""}
    />
  );
}
