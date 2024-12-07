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
import { CodeIcon } from "@cartridge/ui";
import { Method } from "@cartridge/presets";
import { useExplorer } from "@starknet-react/core";

export function VerifiedSessionSummary({
  game,
  policies,
}: {
  game: String;
  policies: ParsedSessionPolicies;
}) {
  const explorer = useExplorer();

  const totalMethods = Object.values(policies.contracts || {}).reduce(
    (acc, contract) => {
      return acc + (contract.methods?.length || 0);
    },
    0,
  );

  const totalMessages = policies.messages?.length ?? 0;

  return (
    <Card>
      <CardHeader icon={<CodeIcon boxSize="24px" m={2} />}>
        <Text
          color="text.primary"
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
        >
          PLAY {game}
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
                {Object.entries(policies.contracts || {}).map(
                  ([address, { name, methods }]) => (
                    <>
                      <HStack py={4}>
                        <Text color="text.primary" fontWeight="bold">
                          {name}
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
                    </>
                  ),
                )}

                {policies.messages?.map((message) => (
                  <VStack
                    key={message.primaryType}
                    py={4}
                    w="full"
                    align="flex-start"
                  >
                    <Text fontSize="sm" fontWeight="bold" mb={4}>
                      Messages
                    </Text>
                    <Stack
                      border="1px solid"
                      spacing={0}
                      borderColor="darkGray.800"
                      borderRadius="md"
                      divider={<Divider borderColor="solid.bg" />}
                      w="full"
                    >
                      {Object.entries(message.types).map(
                        ([typeName, fields]) => (
                          <VStack
                            key={typeName}
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
                                {typeName}
                              </Text>
                            </HStack>
                            {fields.map((field) => (
                              <HStack key={field.name} w="full">
                                <Text fontSize="xs" color="text.secondary">
                                  {field.name}
                                </Text>
                                <Spacer />
                                <Text
                                  fontSize="xs"
                                  color="text.secondaryAccent"
                                >
                                  {field.type}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        ),
                      )}
                    </Stack>
                  </VStack>
                ))}
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
