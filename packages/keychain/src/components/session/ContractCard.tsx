import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
import { useExplorer } from "@starknet-react/core";
import { constants } from "starknet";
import { Method } from "@cartridge/presets";
import { useChainId } from "hooks/connection";

interface ContractCardProps {
  address: string;
  methods: Method[];
  title: string;
  icon: React.ReactNode;
}

export function ContractCard({
  address,
  methods,
  title,
  icon,
}: ContractCardProps) {
  const chainId = useChainId();
  const explorer = useExplorer();

  return (
    <Card>
      <CardHeader icon={icon}>
        <HStack py={4}>
          <Text
            color="text.primary"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {title}
          </Text>
          <Spacer />
          <Link
            color="text.secondary"
            fontSize="xs"
            href={
              chainId === constants.StarknetChainId.SN_MAIN ||
              chainId === constants.StarknetChainId.SN_SEPOLIA
                ? explorer.contract(address)
                : `#`
            }
            target="_blank"
          >
            {formatAddress(address, { first: 5, last: 5 })}
          </Link>
        </HStack>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["methods"]}>
          <AccordionItem value="methods">
            <AccordionTrigger>
              <Text color="text.secondary" fontSize="xs">
                Approve{" "}
                <Text as="span" color="text.secondaryAccent" fontWeight="bold">
                  {methods.length} {methods.length > 1 ? "methods" : "method"}
                </Text>
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <Stack
                border="1px solid"
                spacing={0}
                borderColor="darkGray.800"
                borderRadius="md"
                mt="14px"
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
