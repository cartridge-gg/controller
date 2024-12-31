import { DollarIcon, Button, cn, useDisclosure } from "@cartridge/ui-next";
import { HStack, Input, Spacer, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

export const DEFAULT_AMOUNT = 5;
export const AMOUNTS = [1, 5, 10];

type AmountSelectionProps = {
  amount: number;
  lockSelection?: boolean;
  enableCustom?: boolean;
  onChange?: (amount: number) => void;
};

export function AmountSelection({
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
              variant="secondary"
              className={cn(
                "w-18",
                value === selected && !custom
                  ? "text-secondary-foreground"
                  : "text-muted-foreground",
              )}
              disabled={lockSelection}
              onClick={() => {
                setCustom(false);
                setSelected(value);
                onChange?.(value);
                onClose();
              }}
            >
              {`$${value}`}
            </Button>
          ))}
          {enableCustom && (
            <Button
              variant="secondary"
              className={
                custom ? "text-secondary-foreground" : "text-muted-foreground"
              }
              disabled={lockSelection}
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
          <div className="flex items-center w-full relative">
            <Input
              className="pl-8"
              type="number"
              step={0.01}
              min={0.01}
              value={amount}
              disabled={lockSelection}
              onChange={(e) => {
                const amount = parseInt(e.target.value);
                onChange?.(amount);
              }}
            />
            <DollarIcon size="xs" className="absolute top-3 left-3" />
          </div>
        )}
      </VStack>
    </HStack>
  );
}
