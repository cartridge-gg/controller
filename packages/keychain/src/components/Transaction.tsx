import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Text,
  Link,
  HStack,
  Circle,
  Spacer,
  Divider,
  Spinner,
} from "@chakra-ui/react";

import { constants } from "starknet";
import { StarkscanUrl } from "utils/url";
import { CheckIcon, ExternalIcon, StarknetIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { useChainName } from "hooks/chain";

export type TransactionState = "pending" | "success" | "error";

export interface TransactionProps {
  name: string;
  hash: string;
  chainId: constants.StarknetChainId;
  finalized?: (txState: TransactionState) => void;
}

export function Transaction({
  name,
  chainId,
  hash,
  finalized,
}: TransactionProps) {
  const [state, setState] = useState<TransactionState>("pending");
  const { color, icon } = useMemo(() => getColorIcon(state), [state]);
  const { controller } = useController();

  useEffect(() => {
    if (chainId) {
      let result: TransactionState = "pending";
      controller.account
        .waitForTransaction(hash, {
          retryInterval: 8000,
        })
        .then(() => {
          result = "success";
        })
        .catch((e) => {
          result = "error";
          console.error(e);
        })
        .finally(() => {
          setState(result);
          if (finalized) finalized(result);
        });
    }
  }, [controller, hash, chainId, finalized]);

  const chainName = useChainName(chainId);

  return (
    <HStack w="full" borderRadius="sm" bgColor="solid.primary" p={3}>
      <HStack spacing={3} color={color}>
        <Circle size={7.5} bgColor="solid.secondary">
          {icon}
        </Circle>
        <Text fontSize="11px" color="inherit">
          {name}
        </Text>
      </HStack>

      <Spacer />

      <HStack spacing="15px">
        <HStack color="text.secondary" spacing="5px">
          <StarknetIcon boxSize="14px" />
          <Text color="inherit" fontSize="13px">
            {chainName}
          </Text>
        </HStack>
        <Divider orientation="vertical" bgColor="solid.accent" h="30px" />
        <Link href={StarkscanUrl(chainId).transaction(hash)} isExternal>
          <ExternalIcon boxSize="12px" color="link.blue" />
        </Link>
      </HStack>
    </HStack>
  );
}

function getColorIcon(state: TransactionState): {
  color: string;
  icon: ReactNode;
} {
  switch (state) {
    case "success":
      return {
        color: "green.400",
        icon: <CheckIcon boxSize="12px" color="green.400" />,
      };
    case "pending":
      return {
        color: "white",
        icon: <Spinner size="sm" />,
      };
    case "error":
      return {
        color: "red.400",
        icon: <></>,
      };
  }
}
