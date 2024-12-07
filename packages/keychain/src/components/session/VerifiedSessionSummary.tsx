import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@cartridge/ui-next";
import { ParsedSessionPolicies } from "hooks/session";
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
import { CodeIcon, ExternalIcon } from "@cartridge/ui";
import { Method } from "@cartridge/presets";

export function VerifiedSessionSummary({
  policies,
}: {
  policies: ParsedSessionPolicies;
}) {
  const totalMethods = Object.values(policies).flatMap((contracts) =>
    Object.values(contracts).flatMap(({ methods }) => methods),
  ).length;

  const totalMessages = policies.messages?.length ?? 0;

  return (
    <Card>
      <CardHeader icon={<CodeIcon boxSize="24px" m={2} />}>
        <Text color="text.primary" fontSize="xs" fontWeight="bold">
          PLAY GAME
        </Text>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          <AccordionItem value="contracts">
            <AccordionTrigger>
              <Text color="text.secondary" fontSize="xs">
                Approve{" "}
                <Text as="span" color="text.secondaryAccent" fontWeight="bold">
                  {totalMethods} methods
                </Text>{" "}
                {totalMessages > 0 && (
                  <>
                    and{" "}
                    <Text
                      as="span"
                      color="text.secondaryAccent"
                      fontWeight="bold"
                    >
                      {totalMessages} messages
                    </Text>
                  </>
                )}
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                {Object.entries(policies).map(([category, contracts]) =>
                  Object.entries(contracts).map(
                    ([address, { methods, meta }]) => (
                      <>
                        <HStack py={4}>
                          <Spacer />
                          <Text color="text.secondary">
                            {formatAddress(address)}
                          </Text>
                          <Link target="_blank">
                            <ExternalIcon color="text.secondary" />
                          </Link>
                        </HStack>
                        <Stack
                          border="1px solid"
                          spacing={0}
                          borderColor="darkGray.800"
                          borderRadius="md"
                          divider={<Divider borderColor="solid.bg" />}
                        >
                          {methods.map((method: Method) => (
                            <VStack
                              key={method.name}
                              p={3}
                              gap={3}
                              align="flex-start"
                            >
                              <HStack w="full">
                                <Text
                                  fontSize="xs"
                                  color="text.secondaryAccent"
                                  fontWeight="bold"
                                >
                                  {method.name}
                                </Text>
                                <Spacer />
                                <Text
                                  fontSize="xs"
                                  color="solid.accent"
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
                      </>
                    ),
                  ),
                )}
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
