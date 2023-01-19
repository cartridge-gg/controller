import { useEffect, useState } from "react";
import { HStack, Spinner, Text, VStack } from "@chakra-ui/react";

import { constants, number } from "starknet";
import InfoIcon from "@cartridge/ui/components/icons/Info";
import { formatUnits } from "ethers/lib/utils";
import BN from "bn.js";

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

const Fees = ({
  chainId,
  fees,
}: {
  chainId: constants.StarknetChainId;
  fees?: { base: BN; max: BN };
}) => {
  const [formattedFee, setFormattedFee] = useState<{
    base: string;
    max: string;
  }>();
  useEffect(() => {
    if (!fees) {
      return;
    }

    async function compute() {
      if (chainId === constants.StarknetChainId.MAINNET) {
        let dollarUSLocale = Intl.NumberFormat("en-US");
        const { data } = await fetchEthPrice();
        const usdeth = number.toBN(data.price.amount * 100);
        const overallFee = fees.base.mul(usdeth).toString();
        const suggestedMaxFee = fees.max.mul(usdeth).toString();
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
        fees.max.gt(number.toBN(10000000000000))
          ? {
              base: `~${parseFloat(
                formatUnits(fees.base.toString(), 18),
              ).toFixed(5)} eth`,
              max: `~${parseFloat(formatUnits(fees.max.toString(), 18)).toFixed(
                5,
              )} eth`,
            }
          : {
              base: "<0.00001 eth",
              max: "<0.00001 eth",
            },
      );
    }
    compute();
  }, [chainId, fees]);

  return (
    <HStack
      alignItems="center"
      bgColor="gray.700"
      py="12px"
      px="18px"
      borderRadius="6px"
      justifyContent="space-between"
    >
      <HStack color="gray.200">
        <Text variant="ibm-upper-bold" fontSize={10} color="inherit">
          Network Fees
        </Text>
        <InfoIcon boxSize="12px" />
      </HStack>
      <VStack alignItems="flex-end" spacing="1px">
        {formattedFee ? (
          <>
            <Text fontSize={13}>{formattedFee.base}</Text>
            <Text fontSize={11} color="gray.200">
              Max: {formattedFee.max}
            </Text>
          </>
        ) : (
          <Spinner size="sm" />
        )}
      </VStack>
    </HStack>
  );
};

export default Fees;
