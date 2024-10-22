import { CoinsIcon, EthereumIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { CurrencyBase, CurrencyQuote } from "@cartridge/utils/api/cartridge";
import { formatEther } from "viem";
import { useCountervalue } from "@cartridge/utils";
import { useCreditBalance, useEthBalance } from "hooks/balance";

type BalanceProps = {
  showBalances: ("credits" | "eth" | "strk")[];
};

export function Balance({ showBalances }: BalanceProps) {
  const { balance: creditBalance } = useCreditBalance();
  const { balance: ethBalance } = useEthBalance();
  const { countervalue } = useCountervalue({
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
            <CoinsIcon fontSize={20} />
            <Text>{creditBalance.formatted}</Text>
            <Text color="text.secondary">${creditBalance.formatted}</Text>
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
