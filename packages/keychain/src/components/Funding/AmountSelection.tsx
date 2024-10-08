import { DollarIcon } from "@cartridge/ui";
import {
  Box,
  Button,
  HStack,
  Input,
  Spacer,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

export const DEFAULT_AMOUNT = 5;
export const AMOUNTS = [1, 5, 10];

type AmountSelectionProps = {
  amount: number;
  lockSelection?: boolean;
  enableCustom?: boolean;
  onChange?: (amount: number) => void;
};

export default function AmountSelection({
  amount,
  lockSelection,
  enableCustom,
  onChange,
}: AmountSelectionProps) {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const [selected, setSelected] = useState<number>(amount);
  const [custom, setCustom] = useState<boolean>(false);

  return (
    <HStack>
      <Text
        textTransform="uppercase"
        fontSize="xs"
        fontWeight="semibold"
        color="text.secondary"
      >
        Amount
      </Text>
      <Spacer />
      <VStack>
        <HStack spacing="8px">
          {AMOUNTS.map((value) => (
            <Button
              key={value}
              fontSize="sm"
              fontWeight="semibold"
              color={value === selected && !custom ? "white" : "text.secondary"}
              isDisabled={lockSelection}
              onClick={() => {
                setCustom(false);
                setSelected(value);
                onChange(value);
                onClose();
              }}
            >
              {`$${value}`}
            </Button>
          ))}
          {enableCustom && (
            <Button
              fontSize="sm"
              color={custom ? "white" : "text.secondary"}
              isDisabled={lockSelection}
              onClick={() => {
                setCustom(true);
                onOpen();
              }}
            >
              Custom
            </Button>
          )}
        </HStack>
        {isOpen && (
          <Box position="relative" w="full">
            <Input
              pl="32px"
              h="40px"
              type="number"
              step={0.01}
              min={0.01}
              fontSize="sm"
              value={amount}
              isDisabled={lockSelection}
              onChange={(e) => {
                const amount = parseInt(e.target.value);
                onChange(amount);
              }}
            />
            <DollarIcon
              position="absolute"
              color="text.secondary"
              top="10px"
              left="10px"
              boxSize="20px"
            />
          </Box>
        )}
      </VStack>
    </HStack>
  );
}
