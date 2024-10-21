import { CreditsIcon, EthereumIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { CurrencyBase, CurrencyQuote } from "@cartridge/utils/api/cartridge";
import { useBalance } from "hooks/token";
import { formatEther } from "viem";
import { useCountervalue } from "@cartridge/utils";

type BalanceProps = {
  showBalances: ("credits" | "eth" | "strk")[];
};

export function Balance({ showBalances }: BalanceProps) {
  const { ethBalance, creditsBalance } = useBalance();
  const { countervalue } = useCountervalue({
    endpoint: process.env.NEXT_PUBLIC_API_URL,
    balance: formatEther(ethBalance.value),
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });

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
            <Text>{creditsBalance.formatted}</Text>
            <Text color="text.secondary">${creditsBalance.formatted}</Text>
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
            <Text>{ethBalance.formatted}</Text>
            <Text color="text.secondary">${countervalue.formatted}</Text>
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
