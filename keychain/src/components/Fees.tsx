import { useEffect, useState } from "react";
import {
  Divider,
  HStack,
  Spacer,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { constants, number } from "starknet";
import { formatUnits } from "ethers/lib/utils";
import BN from "bn.js";
import { Error } from "components/Error";

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
  error,
  chainId,
  fees,
  balance,
  approved,
}: {
  error: Error;
  chainId: constants.StarknetChainId;
  fees?: { base: BN; max: BN };
  balance: string;
  approved?: string;
}) => {
  const [formattedFee, setFormattedFee] = useState<{
    base: string;
    max: string;
  }>();
  useEffect(() => {
    if (!fees || !balance) {
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
        overflow="hidden"
        borderRadius="6px"
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
          <LineItem name="Calculating Fees" isLoading={true} />
        )}
      </VStack>
    </>
  );
};

const LineItem = ({
  name,
  description,
  value,
  isLoading = false,
}: {
  name: string;
  description?: string;
  value?: string;
  isLoading?: boolean;
}) => (
  <HStack w="full" h="40px" p="18px" bgColor="gray.700" color="gray.200">
    <Text variant="ibm-upper-bold" fontSize={10} color="inherit">
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
              <Divider orientation="vertical" borderColor="gray.600" h="16px" />
            </>
          )}
          <Text fontSize={13}>{value}</Text>
        </>
      )}
    </HStack>
  </HStack>
);
export default Fees;
