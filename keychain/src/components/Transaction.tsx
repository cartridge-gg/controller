import { ReactNode, useEffect, useMemo, useState } from "react";
import { Text, Link, HStack, Circle, Spacer, Divider } from "@chakra-ui/react";

import StarknetIcon from "@cartridge/ui/components/icons/Starknet";
import CheckIcon from "@cartridge/ui/components/icons/Check";
import LinkIcon from "@cartridge/ui/components/icons/Link";
import { Loading } from "@cartridge/ui/index";
import { constants } from "starknet";
import Controller from "utils/controller";
import { StarkscanUrl } from "utils/url";

export type TransactionState = "pending" | "success" | "error";

export interface TransactionProps {
  name: string;
  hash: string;
  chainId: constants.StarknetChainId;
  finalized?: (TransactionState) => void;
  showChainId?: boolean;
  initialState?: TransactionState;
}

export const Transaction = ({
  name,
  chainId,
  hash,
  finalized,
  showChainId,
  initialState,
}: TransactionProps) => {
  const [state, setState] = useState<TransactionState>(initialState ?? "pending");
  const { color, icon } = useMemo(() => getColorIcon(state), [state]);
  const controller = useMemo(() => Controller.fromStore(), []);

  useEffect(() => {
    if (!initialState && chainId) {
      let result: TransactionState = "pending";
      controller
        .account(chainId)
        .waitForTransaction(hash, 8000, ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"])
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
  return (
    <HStack w="full" borderRadius="4px" bgColor="gray.700" p="12px">
      <HStack spacing="12px" color={color}>
        <Circle size="30px" bgColor="gray.600">
          {icon}
        </Circle>
        <Text variant="ibm-upper-bold" fontSize="11px" color="inherit">
          {name}
        </Text>
      </HStack>
      <Spacer />
      <HStack spacing="15px">
        {showChainId && (
          <>
            <HStack color="gray.200" spacing="5px">
              <StarknetIcon boxSize="14px" />
              <Text color="inherit" fontSize="13px">
                {chainId === constants.StarknetChainId.MAINNET
                  ? "Mainnet"
                  : "Testnet"}
              </Text>
            </HStack>
            <Divider orientation="vertical" bgColor="gray.500" h="30px" />
          </>
        )}
        <Link href={StarkscanUrl(chainId).transaction(hash)} isExternal>
          <LinkIcon boxSize="12px" color="blue.400" />
        </Link>
      </HStack>
    </HStack>
  );
};

const getColorIcon = (
  state: TransactionState,
): { color: string; icon: ReactNode } => {
  switch (state) {
    case "success":
      return {
        color: "green.400",
        icon: <CheckIcon boxSize="12px" color="green.400" />,
      };
    case "pending":
      return {
        color: "white",
        icon: <Loading height="12px" width="12px" fill="white" />,
      };
    case "error":
      return {
        color: "red.400",
        icon: <></>,
      };
  }
};
