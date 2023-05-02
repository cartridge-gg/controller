import { Box, Circle, HStack, Text } from "@chakra-ui/react";
import Container from "components/Container";
import { Header } from "components/Header";
import CreditCardIcon from "components/icons/CreditCard";
import EthereumLarge from "components/icons/EthereumLarge";
import Transfer from "components/icons/Transfer";
import { useState } from "react";
import { constants } from "starknet";
import Controller from "utils/controller";
import BridgeEth from "./BridgeEth";
import CreditCard from "./CreditCard";

const Items = ({
  items,
}: {
  items: {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
  }[];
}) => {
  return (
    <Box
      w="full"
      _hover={{
        cursor: "pointer",
      }}
    >
      {items.map((item) => {
        return (
          <HStack
            key={item.text}
            h="60px"
            w="full"
            p="12px"
            spacing="18px"
            bgColor="gray.700"
            borderBottom="1px solid"
            borderBottomColor="gray.800"
            _first={{
              borderTopRadius: "12px",
            }}
            _last={{
              borderBottomRadius: "12px",
            }}
            _hover={{
              bgColor: "gray.600",
            }}
            onClick={item.onClick}
            data-group
          >
            <Circle
              size="36px"
              bgColor="gray.600"
              _groupHover={{
                bgColor: "gray.500",
              }}
            >
              {item.icon}
            </Circle>
            <Text color="gray.200" fontSize="14px">
              {item.text}
            </Text>
          </HStack>
        );
      })}
    </Box>
  );
};

const OnRamp = ({
  chainId,
  controller,
  onBack,
  onClose,
  onLogout,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onBack: () => void;
  onClose: () => void;
  onLogout: () => void;
}) => {
  const [layer1, setLayer1] = useState<boolean>(false);
  const [creditCard, setCreditCard] = useState<boolean>(false);

  if (!layer1 && !creditCard) {
    return (
      <Container>
        <Header
          chainId={chainId}
          address={controller.address}
          onBack={onBack}
          onClose={onClose}
        />
        <Circle size="48px" bgColor="gray.700" m="-18px 0 18px 0">
          <EthereumLarge color="green.400" boxSize="30px" />
        </Circle>
        <Text
          width="60%"
          fontSize="17px"
          lineHeight="24px"
          fontWeight="600"
          align="center"
          mb="36px"
        >
          How would you like to fund your account?
        </Text>
        <Items
          items={[
            {
              icon: <Transfer w="24px" h="24px" color="green.400" />,
              text: "Deposit From Layer 1",
              onClick: () => {
                setLayer1(true);
              },
            },
            {
              icon: <CreditCardIcon w="24px" h="24px" color="green.400" />,
              text: "Purchase with Credit Card",
              onClick: () => {
                setCreditCard(true);
              },
            },
            // {
            //   icon: <StarknetTransfer w="24px" h="24px" color="green.400" />,
            //   text: "From another Starknet account",
            // },
          ]}
        />
      </Container>
    );
  }

  if (layer1) {
    return (
      <BridgeEth
        chainId={chainId}
        controller={controller}
        onBack={onBack}
        onClose={onClose}
        onLogout={onLogout}
      />
    );
  }

  if (creditCard) {
    return (
      <CreditCard
        chainId={chainId}
        controller={controller}
        onBack={onBack}
        onClose={onClose}
        onLogout={onLogout}
      />
    );
  }
};

export default OnRamp;
