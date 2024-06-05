import { useEffect, useState } from "react";
import {
  Divider,
  HStack,
  Spacer,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { constants } from "starknet";
import { formatUnits } from "viem";
import { Error } from "components/Error";
import { useChainId } from "hooks/connection";

async function fetchEthPrice() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: `{"query":"query { price(quote: ETH, base: USD) { amount }}"}`,
  });
  return res.json();
}

export function Fees({
  error,
  fees,
  balance,
  approved,
}: {
  error: Error;
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
      if (chainId === constants.StarknetChainId.SN_MAIN) {
        let dollarUSLocale = Intl.NumberFormat("en-US");
        const { data } = await fetchEthPrice();
        const usdeth = BigInt(data.price.amount) * 100n;
        const overallFee = fees.base * usdeth;
        const suggestedMaxFee = fees.max * usdeth;
        setFormattedFee({
          base: `~$${dollarUSLocale.format(
            parseFloat(formatUnits(overallFee, 20)),
          )}`,
          max: `~$${dollarUSLocale.format(
            parseFloat(formatUnits(suggestedMaxFee, 20)),
          )}`,
        });
        return;
      }

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
    <>
      <Error error={error} />
      <VStack
        w="full"
        overflow="hidden"
        borderRadius="md"
        spacing="1px"
        align="flex-start"
      >
        {formattedFee || error ? (
          <>
            {approved && (
              <LineItem name="Cost" description="" value={approved} />
            )}

            <LineItem
              name="Network Fee"
              description={!error && `Max: ${formattedFee?.max}`}
              value={!error ? formattedFee?.base : "..."}
              isLoading={!formattedFee && !error}
            />

            {approved && (
              <LineItem
                name="Total"
                description={`Balance: ${Number(
                  parseFloat(balance).toFixed(5),
                )}`}
                value={approved ? approved : formattedFee?.base}
              />
            )}
          </>
        ) : (
          <LineItem name="Calculating Fees" isLoading />
        )}
      </VStack>
    </>
  );
}

function LineItem({
  name,
  description,
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
      <Text fontSize="2xs" color="inherit">
        {name}
      </Text>
      <Spacer />
      <HStack spacing="12px">
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            {description && (
              <>
                <Text fontSize={11} color="inherit">
                  {description}
                </Text>
                <Divider
                  orientation="vertical"
                  borderColor="solid.secondary"
                  h="16px"
                />
              </>
            )}
            <Text fontSize={13}>{value}</Text>
          </>
        )}
      </HStack>
    </HStack>
  );
}
