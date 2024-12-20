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
import { Divider, HStack, Spacer, Stack, Text, VStack } from "@chakra-ui/react";
import { useExplorer } from "@starknet-react/core";
import { constants } from "starknet";
import { Method } from "@cartridge/presets";
import { useChainId } from "@/hooks/connection";

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
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase">{title}</div>
          <a
            className="text-xs text-muted-foreground cursor-pointer hover:underline"
            href={
              chainId === constants.StarknetChainId.SN_MAIN ||
              chainId === constants.StarknetChainId.SN_SEPOLIA
                ? explorer.contract(address)
                : `#`
            }
            target="_blank"
            rel="noreferrer"
          >
            {formatAddress(address, { first: 5, last: 5 })}
          </a>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" defaultValue={["methods"]}>
          <AccordionItem value="methods" className="flex flex-col gap-3">
            <AccordionTrigger className="text-xs text-muted-foreground">
              Approve{" "}
              <span className="text-accent-foreground font-bold">
                {methods.length} {methods.length > 1 ? "methods" : "method"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
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
                        {method.name ?? humanizeString(method.entrypoint)}
                      </Text>
                      <Spacer />
                      <Text fontSize="xs" color="text.secondaryAccent">
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

export function humanizeString(str: string): string {
  return (
    str
      // Convert from camelCase or snake_case
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces
      .replace(/_/g, " ") // snake_case to spaces
      .toLowerCase()
      // Capitalize first letter
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}
