import { useEffect, useState } from "react";
import { Flex, Text, VStack } from "@chakra-ui/react";

import { typedData as td, shortString, constants, Signature } from "starknet";

import { Banner } from "components/Banner";
import Controller from "utils/controller";
import Footer from "./Footer";
import { Error, ResponseCodes } from "@cartridge/controller";

const SignMessage = ({
  controller,
  origin,
  typedData,
  chainId,
  onSign,
  onCancel,
}: {
  controller: Controller;
  origin: string;
  typedData: td.TypedData;
  chainId: constants.StarknetChainId;
  onSign: (sig: Signature) => void;
  onCancel: (error: Error) => void;
}) => {
  const [messageData, setMessageData] = useState({});

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
    <Flex flexDirection="column" p="16px">
      <Banner
        title="Signature Request"
        description={`${origin} is asking you to sign a message`}
        chainId={chainId}
        py="20px"
      />
      <VStack
        p="12px"
        bgColor="gray.600"
        borderRadius="5px"
        align="flex-start"
        maxHeight="290px"
        overflowY="auto"
      >
        <Text
          fontSize="11px"
          color="gray.200"
          as="pre"
          mb="4"
          whiteSpace="pre-wrap"
          wordBreak="break-all"
        >
          {JSON.stringify(messageData, null, 2)}
        </Text>
      </VStack>
      <Footer
        onConfirm={async () => {
          const sig = await controller.account(chainId).signMessage(typedData);
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
    </Flex>
  );
};

export default SignMessage;
