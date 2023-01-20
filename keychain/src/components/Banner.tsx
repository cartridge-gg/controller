import { ReactNode } from "react";
import { VStack, HStack, Text, Circle, StyleProps } from "@chakra-ui/react";
import StarknetIcon from "@cartridge/ui/components/icons/Starknet";
import { constants } from "starknet";

export interface BannerProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  chainId?: constants.StarknetChainId;
}

export const Banner = ({
  title,
  description,
  icon,
  chainId,
  ...rest
}: BannerProps & StyleProps) => {
  return (
    <VStack gap="5px" {...rest}>
      {icon && (
        <Circle bgColor="gray.700" size="48px">
          {icon}
        </Circle>
      )}
      <Text fontSize="17px" fontWeight="bold">
        {title}
      </Text>
      {description && (
        <Text fontSize="13px" color="gray.200" align="center" pb="12px">
          {description}
        </Text>
      )}
      {chainId && (
        <HStack color="white" py="7px" px="12px" bgColor="gray.700" borderRadius="full">
          <StarknetIcon boxSize="14px" />
          <Text fontSize="10px" variant="ibm-upper-bold">
            {chainId === constants.StarknetChainId.MAINNET
              ? "mainnet"
              : "testnet"}
          </Text>
        </HStack>
      )}
    </VStack>
  );
};
