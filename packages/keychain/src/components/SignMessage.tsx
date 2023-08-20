import { useEffect, useState } from "react";
import { Circle, Flex, HStack, Spacer, Text, VStack } from "@chakra-ui/react";

import { typedData as td, shortString, constants, Signature } from "starknet";

import Container from "./legacy/Container";
import Controller from "utils/controller";
import Footer from "./Footer";
import { ResponseCodes } from "@cartridge/controller";
import { Error } from "@cartridge/controller/src/types";
import { Header } from "./Header";
import Transfer from "./icons/Transfer";

const DataContainer = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Flex
      direction="column"
      align="start"
      w="full"
      css={{
        "> p": {
          width: "100%",
          padding: "12px",
          fontSize: "13px",
          lineHeight: "16px",
          backgroundColor: "var(--chakra-colors-gray-600)",
        },
        "> p:first-of-type": {
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.05em",
          lineHeight: "18px",
          textTransform: "uppercase",
          color: "var(--chakra-colors-gray-200)",
          backgroundColor: "var(--chakra-colors-gray-700)",
          borderRadius: "6px 6px 0 0",
        },
        "> p:last-of-type": {
          borderRadius: "0 0 6px 6px",
        },
        "> p:not(p:last-of-type)": {
          borderBottom: "1px solid var(--chakra-colors-gray-800)",
        },
      }}
    >
      <>
        <Text>{title}</Text>
        {children}
      </>
    </Flex>
  );
};

const SignMessage = ({
  controller,
  origin,
  typedData,
  chainId,
  onSign,
  onCancel,
  onLogout,
}: {
  controller: Controller;
  origin: string;
  typedData: td.TypedData;
  chainId: constants.StarknetChainId;
  onSign: (sig: Signature) => void;
  onCancel: (error: Error) => void;
  onLogout: () => void;
}) => {
  const [messageData, setMessageData] = useState<td.TypedData>();

  useEffect(() => {
    if (!typedData) return;
    const primaryTypeData = typedData.types[typedData.primaryType];

    // Recursively decodes all nested `felt*` types
    // to their ASCII equivalents
    const convertFeltArraysToString = (
      initial: object,
      messageType: Array<{ name: string; type: string }>,
    ) => {
      for (const typeMember of messageType) {
        if (typeMember.type === "felt*") {
          const stringArray: Array<string> = initial[typeMember.name].map(
            (hex: string) => shortString.decodeShortString(hex),
          );
          initial[typeMember.name] = stringArray.join("");
        } else if (typeMember.type !== "felt" && typeMember.type !== "string") {
          convertFeltArraysToString(
            initial[typeMember.name],
            typedData.types[typeMember.type],
          );
        }
      }
    };

    convertFeltArraysToString(typedData.message, primaryTypeData);
    setMessageData(typedData);
  }, [typedData]);

  return (
    <Container>
      <Header
        address={controller.address}
        chainId={chainId}
        onClose={() =>
          onCancel({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          })
        }
        onLogout={onLogout}
      />
      <Spacer minH="36px" />
      <Flex direction="column" align="start" gap="18px" w="full">
        <HStack
          w="full"
          pb="24px"
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          <Circle bgColor="gray.700" size="40px">
            <Transfer color="green.400" fontSize="30px" />
          </Circle>
          <VStack align="start">
            <Text fontSize="17px" lineHeight="20px" fontWeight="600">
              Signature Request
            </Text>
            <Text color="gray.200" fontSize="12px" lineHeight="16px">
              {origin} is asking you to sign a message
            </Text>
          </VStack>
        </HStack>
        {(() => {
          if (!messageData) return <></>;
          const ptName = messageData.primaryType;
          const pt = messageData.types[ptName];
          const values = (typeName: string) => {
            const v = messageData.message[typeName];
            if (typeof v === "object") {
              return Object.entries(v).map(([key, value]) => {
                return (
                  <Text key={key}>
                    <Text as="span" opacity="50%" textTransform="capitalize">
                      {key}:
                    </Text>{" "}
                    {value}
                  </Text>
                );
              });
            } else {
              return <Text>{v as string}</Text>;
            }
          };

          return pt.map((typ) => {
            return (
              <DataContainer key={typ.name} title={typ.name}>
                {values(typ.name)}
              </DataContainer>
            );
          });
        })()}
      </Flex>

      <Footer
        onConfirm={async () => {
          const account = controller.account(chainId);
          const sig = await account.signMessage(typedData);
          onSign(sig);
        }}
        onCancel={() => {
          onCancel({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          });
        }}
        confirmText="SIGN"
        cancelText="REJECT"
      />
    </Container>
  );
};

export default SignMessage;
