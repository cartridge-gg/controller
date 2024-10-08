import { CreditsIcon, EthereumIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "generated/graphql";
import { useBalance } from "hooks/token";
import { useMemo } from "react";
import { formatEther } from "viem";

type BalanceProps = {
  showBalances: ("credits" | "eth" | "strk")[];
};

export function Balance({ showBalances }: BalanceProps) {
  const { ethBalance, creditsBalance } = useBalance();

  const priceQuery = usePriceQuery({
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });
  const price = priceQuery.data?.price;

  const usdBalance = useMemo(() => {
    if (!price || !ethBalance) {
      return 0;
    }

    return parseFloat(formatEther(ethBalance)) * parseFloat(price.amount);
  }, [ethBalance, price]);

  return (
    <VStack w="full" borderRadius="base" overflow="hidden" spacing="1px">
      <HStack
        w="full"
        align="center"
        fontSize="sm"
        p={3}
        bg="solid.primary"
        fontWeight="semibold"
      >
        <Text textTransform="uppercase" fontSize="xs" color="text.secondary">
          Balance
        </Text>
      </HStack>
      {showBalances.includes("credits") && (
        <HStack
          w="full"
          align="center"
          fontSize="sm"
          p={3}
          bg="solid.primary"
          fontWeight="semibold"
        >
          <HStack>
            <CreditsIcon fontSize={20} />
            <Text>{creditsBalance?.toFixed(2)}</Text>
          </HStack>
          <Spacer />
          <HStack color="text.secondary">
            <Text color="inherit" fontSize="12px">
              CREDITS
            </Text>
          </HStack>
        </HStack>
      )}
      {showBalances.includes("eth") && (
        <HStack
          w="full"
          align="center"
          fontSize="sm"
          p={3}
          bg="solid.primary"
          fontWeight="semibold"
        >
          <HStack>
            <EthereumIcon fontSize={20} />
            <Text>{usdBalance?.toFixed(2)}</Text>
          </HStack>
          <Spacer />
          <HStack color="text.secondary">
            <Text color="inherit" fontSize="12px">
              ETH
            </Text>
          </HStack>
        </HStack>
      )}
    </VStack>
  );
}
