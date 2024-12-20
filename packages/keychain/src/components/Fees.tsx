import { useEffect, useState } from "react";
import { HStack, Spacer, Spinner, Text, VStack } from "@chakra-ui/react";
import { formatUnits } from "viem";
import { useChainId } from "@/hooks/connection";
import { ErrorAlertIcon, EthereumIcon } from "@cartridge/ui-next";

export function Fees({
  maxFee,
  variant,
}: {
  maxFee?: bigint;
  variant?: Variant;
}) {
  const chainId = useChainId();
  const [formattedFee, setFormattedFee] = useState<string>();

  useEffect(() => {
    if (maxFee === undefined) {
      return;
    }

    setFormattedFee(
      maxFee === 0n
        ? "FREE"
        : maxFee > 10000000000000n
        ? `~${parseFloat(formatUnits(maxFee, 18)).toFixed(5)}`
        : "<0.00001",
    );
  }, [chainId, maxFee]);

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
          <LineItem
            name="Network Fee"
            value={formattedFee}
            isLoading={!formattedFee}
            variant={variant}
          />
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
  variant,
}: {
  name: string;
  description?: string;
  value?: string;
  isLoading?: boolean;
  variant?: Variant;
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
        <HStack gap={0}>
          {variant && <ErrorAlertIcon variant={variant} />}
          {value !== "FREE" && (
            <EthereumIcon className="text-secondary-foreground" />
          )}
          <Text fontSize={13}>{value}</Text>
        </HStack>
      )}
    </HStack>
  );
}

type Variant = "info" | "warning" | "error";
