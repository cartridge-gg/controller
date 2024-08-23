"use client";

import { Container } from "components/layout";
import { SparklesDuoIcon } from "@cartridge/ui";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { title, description } = router.query;

  return (
    <Container
      variant="connect"
      hideAccount
      Icon={SparklesDuoIcon}
      title={title ? (title as string) : "Success!"}
      description={description ? (description as string) : ""}
    />
  );
}
