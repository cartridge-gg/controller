import { CreditsIcon, EthereumIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "generated/graphql";
import { useBalance } from "hooks/token";
import { formatEther } from "viem";

type BalanceProps = {
  showBalances: ("credits" | "eth" | "strk")[];
};

function formatTokenBalance(balance: bigint): string {
  const formattedBalance = parseFloat(formatEther(balance));
  if (formattedBalance === 0) {
    return "0.00";
  }

  return formattedBalance < 0.01
    ? `~${formattedBalance.toFixed(2)}`
    : formattedBalance.toFixed(2);
}

function formatUsdBalance(balance: bigint, price: number) {
  return parseFloat(formatEther(balance)) * price
}

export function Balance({ showBalances }: BalanceProps) {
  const { ethBalance, creditsBalance } = useBalance();

  const priceQuery = usePriceQuery({
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });
  const price = parseFloat(priceQuery.data?.price?.amount || "");

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
            <Text>{formatTokenBalance(creditsBalance)}</Text>
            <Text color="text.secondary">${formatUsdBalance(creditsBalance, 1).toFixed(2)}</Text>
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
            <Text>{formatTokenBalance(ethBalance)}</Text>
            <Text color="text.secondary">${formatUsdBalance(ethBalance, price).toFixed(2)}</Text>
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
