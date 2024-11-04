import { CoinsIcon, EthereumIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { CurrencyBase, CurrencyQuote } from "@cartridge/utils/api/cartridge";
import { formatEther } from "viem";
import {
  ETH_CONTRACT_ADDRESS,
  useCountervalue,
  useCreditBalance,
  useERC20Balance,
} from "@cartridge/utils";
import { useController } from "hooks/controller";

type BalanceProps = {
  showBalances: ("credits" | "eth" | "strk")[];
};

export function Balance({ showBalances }: BalanceProps) {
  const { controller } = useController();
  const { balance: creditBalance } = useCreditBalance({
    username: controller.username(),
    interval: 3000,
  });
  const {
    data: [eth],
  } = useERC20Balance({
    address: controller.address,
    contractAddress: ETH_CONTRACT_ADDRESS,
    provider: controller,
    interval: 3000,
    fixed: 2,
  });
  const { countervalue } = useCountervalue({
    balance: formatEther(eth?.balance.value || 0n),
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
            <Text>{eth?.balance.formatted ?? "0.00"}</Text>
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
