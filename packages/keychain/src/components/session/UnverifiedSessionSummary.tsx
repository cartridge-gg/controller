import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CardIcon,
  CoinsIcon,
  ScrollIcon,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import {
  Divider,
  HStack,
  Link,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { toArray } from "@cartridge/controller";
import { useExplorer } from "@starknet-react/core";
import { ParsedSessionPolicies } from "hooks/session";
import { SignMessages } from "./SignMessages";

export function UnverifiedSessionSummary({
  policies,
}: {
  policies: ParsedSessionPolicies;
}) {
  const explorer = useExplorer();

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(policies.contracts ?? {}).map(([address, contract]) => {
        const methods = toArray(contract.methods);
        const title = !contract.meta
          ? "Contract"
          : `${contract.meta.name} token`;
        const icon = !contract.meta ? (
          <CardIcon>
            <ScrollIcon variant="line" />
          </CardIcon>
        ) : contract.meta.logoUrl ? (
          <CardIcon src={contract.meta.logoUrl} />
        ) : (
          <CardIcon>
            <CoinsIcon variant="line" />
          </CardIcon>
        );

        return (
          <Card key={address}>
            <CardHeader icon={icon}>
              <Text
                color="text.primary"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
              >
                {title}
              </Text>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={["methods"]}>
                <AccordionItem value="methods">
                  <AccordionTrigger>
                    <Text color="text.secondary" fontSize="xs">
                      Approve{" "}
                      <Text
                        as="span"
                        color="text.secondaryAccent"
                        fontWeight="bold"
                      >
                        {methods.length}{" "}
                        {methods.length > 1 ? "methods" : "method"}
                      </Text>
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <HStack py={4}>
                        <Text color="text.primary" fontWeight="bold">
                          {title}
                        </Text>
                        <Spacer />
                        <Link
                          color="text.secondary"
                          fontSize="xs"
                          href={explorer.contract(address)}
                          target="_blank"
                        >
                          {formatAddress(address, { first: 5, last: 5 })}
                        </Link>
                      </HStack>
                      <Stack
                        border="1px solid"
                        spacing={0}
                        borderColor="darkGray.800"
                        borderRadius="md"
                        divider={<Divider borderColor="solid.bg" />}
                      >
                        {methods.map((method) => (
                          <VStack
                            key={method.entrypoint}
                            p={3}
                            gap={3}
                            align="flex-start"
                          >
                            <HStack w="full">
                              <Text
                                fontSize="xs"
                                color="text.primary"
                                fontWeight="bold"
                              >
                                {method.name}
                              </Text>
                              <Spacer />
                              <Text
                                fontSize="xs"
                                color="text.secondaryAccent"
                                fontWeight="bold"
                              >
                                {method.entrypoint}
                              </Text>
                            </HStack>
                            {method.description && (
                              <Text fontSize="xs" color="text.secondary">
                                {method.description}
                              </Text>
                            )}
                          </VStack>
                        ))}
                      </Stack>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      })}

      <SignMessages messages={policies.messages} />
    </div>
  );
}
