import { useEffect, useState } from "react";
import { HStack, Spacer, Spinner, Text, VStack } from "@chakra-ui/react";

import { formatUnits } from "viem";
import { useChainId } from "hooks/connection";
import { EthereumIcon } from "@cartridge/ui";

export function Fees({
  fees,
  balance,
  approved,
}: {
  fees?: { base: bigint; max: bigint };
  balance: string;
  approved?: string;
}) {
  const chainId = useChainId();
  const [formattedFee, setFormattedFee] = useState<{
    base: string;
    max: string;
  }>();

  useEffect(() => {
    if (!fees || !balance) {
      return;
    }
    async function compute() {
      setFormattedFee(
        fees.max > 10000000000000n
          ? {
              base: `~${parseFloat(formatUnits(fees.base, 18)).toFixed(5)} eth`,
              max: `~${parseFloat(formatUnits(fees.max, 18)).toFixed(5)} eth`,
            }
          : {
              base: "<0.00001",
              max: "<0.00001",
            },
      );
    }
    compute();
  }, [chainId, fees, balance, approved]);

  return (
    <VStack
      w="full"
      overflow="hidden"
      borderRadius="base"
      spacing="1px"
      align="flex-start"
    >
      {formattedFee ? (
        <>
          {approved && <LineItem name="Cost" value={approved} />}

          <LineItem
            name="Network Fee"
            value={formattedFee?.base}
            isLoading={!formattedFee}
          />

          {approved && (
            <LineItem
              name="Total"
              value={approved ? approved : formattedFee?.base}
            />
          )}
        </>
      ) : (
        <LineItem name="Calculating Fees" isLoading />
      )}
    </VStack>
  );
}

function LineItem({
  name,
  value,
  isLoading = false,
}: {
  name: string;
  description?: string;
  value?: string;
  isLoading?: boolean;
}) {
  return (
    <HStack w="full" h="40px" p={4} bg="solid.primary" color="text.secondary">
      <Text
        fontSize="xs"
        color="inherit"
        textTransform="uppercase"
        fontWeight="bold"
      >
        {name}
      </Text>
      <Spacer />

      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <HStack>
          <EthereumIcon color="text.primary" />
          <Text fontSize={13}>{value}</Text>
        </HStack>
      )}
    </HStack>
  );
}
