import { useEffect, useState } from "react";
import { HStack, Spinner, Text, VStack } from "@chakra-ui/react";

import {
  constants,
  number,
} from "starknet";
import InfoIcon from "@cartridge/ui/components/icons/Info";
import { formatUnits } from "ethers/lib/utils";

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
  fees?: { base: number.BigNumberish; max: number.BigNumberish };
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
      spacing="12px"
      bgColor="gray.700"
      py="11px"
      px="15px"
      borderRadius="8px"
      justifyContent="space-between"
    >
      <HStack>
        <Text
          textTransform="uppercase"
          fontSize={11}
          fontWeight={700}
          color="gray.100"
        >
          Network Fees
        </Text>
        <InfoIcon />
      </HStack>
      <VStack alignItems="flex-end">
        {formattedFee ? (
          <>
            <Text fontSize={13}>{formattedFee.base}</Text>
            <Text fontSize={11} color="gray.200" mt="1px !important">
              Max: {formattedFee.max}
            </Text>
          </>
        ) : (
          <Spinner />
        )}
      </VStack>
    </HStack>
  );
};

export default Fees;