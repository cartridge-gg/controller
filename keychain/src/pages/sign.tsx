import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box, Flex, Spacer, Text, Image } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { TypedData } from "starknet/utils/typedData";
import { decodeShortString } from "starknet/utils/shortString";
import { Header } from "components/Header";

import Banner from "components/Banner";
import ButtonBar from "components/ButtonBar";
import Details from "components/Details";
import Controller from "utils/controller";

const DetailsHeader = (data: {
  media?: Array<{ uri: string }>;
  name: string;
}) => {
  return (
    <Box>
      <Flex justify="center" alignItems="center">
        {data.media && (
          <Image
            borderRadius="full"
            boxSize="20px"
            src={data.media[0].uri}
            mr="8px"
            alt="Details Header"
          />
        )}
        <strong>{data.name}</strong>
      </Flex>
      <Box mt="3" textColor="#808080">
        <strong>{data.name}</strong> is asking you to sign the following
        message:
      </Box>
    </Box>
  );
};

const DetailsTransaction = (items: Object) => {
  const entry = (key: string, value: any) => {
    return (
      <Box key={key}>
        <Text fontFamily="LD_Mono" fontWeight="bold" textColor="#7A857A" my="1">
          {key}
        </Text>
        <Text>{value}</Text>
      </Box>
    );
  };

  let entries: Array<React.ReactNode> = [];
  for (let key in items) {
    entries.push(entry(key, items[key]));
  }

  return (
    <Box borderLeft="solid thick #1E221F">
      <Box mx="4">{entries}</Box>
    </Box>
  );
};

const MessageContent = (message: object) => {
  return (
    <Box>
      <strong>
        <Text as="pre" mb="4" whiteSpace="pre-wrap" wordBreak="break-all">
          {message ? JSON.stringify(message, null, 2) : ""}
        </Text>
      </strong>
      <Text mb="4" textColor="#808080">
        This request will not trigger a blockchain transaction or cost any gas
        fees.
      </Text>
      <Text mb="4" textColor="#808080">
        Your authentication status will reset after 24 hours.
      </Text>
    </Box>
  );
};

const Sign: NextPage = () => {
  const controller = useMemo(() => Controller.fromStore(), []);
  const [nonce, setNonce] = useState("...");
  const [messageData, setMessageData] = useState({});
  const router = useRouter();

  const { id, origin, typedData } = router.query;
  const headerData = { icon: <></>, name: origin as string };

  useEffect(() => {
    if (!controller) {
      router.replace(`${process.env.NEXT_PUBLIC_SITE_URL}/welcome`);
      return;
    }
  }, [router, controller]);

  useEffect(() => {
    if (!typedData) return;
    const msgData: TypedData = JSON.parse(typedData as string);
    const primaryTypeData = msgData.types[msgData.primaryType];

    // Recursively decodes all nested `felt*` types
    // to their ASCII equivalents
    const convertFeltArraysToString = (
      initial: object,
      messageType: Array<{ name: string; type: string }>,
    ) => {
      for (const typeMember of messageType) {
        if (typeMember.type === "felt*") {
          const stringArray: Array<string> = initial[typeMember.name].map(
            (hex: string) => decodeShortString(hex),
          );
          initial[typeMember.name] = stringArray.join("");
        } else if (typeMember.type !== "felt" && typeMember.type !== "string") {
          convertFeltArraysToString(
            initial[typeMember.name],
            msgData.types[typeMember.type],
          );
        }
      }
    };

    convertFeltArraysToString(msgData.message, primaryTypeData);
    setMessageData(msgData);
  }, [typedData]);

  if (!controller) {
    return <></>;
  }

  return (
    <Box h="100vh">
      <Flex flexDirection="column" h="100%">
        <Header address={controller.address} />
        <Flex flexDirection="column" p={["3.5", "6"]} flex="1">
          <Banner title="Signature Request">
            <></>
          </Banner>
          <Details header={DetailsHeader(headerData)}>
            {MessageContent(messageData)}
            {DetailsTransaction({
              "WALLET ADDRESS": controller.address,
              NONCE: nonce,
            })}
          </Details>
          <Spacer />
          <ButtonBar
            expiresIn="1 DAY"
            onSubmit={() => {
              const bc = new BroadcastChannel(id as string);
              bc.postMessage({});
              window.close();
            }}
            onCancel={() => {
              const bc = new BroadcastChannel(id as string);
              bc.postMessage({ error: "User cancelled" });
              window.close();
            }}
            isSubmitting={false}
          >
            <Box mr="3">SIGN</Box>
          </ButtonBar>
        </Flex>
      </Flex>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(Sign), { ssr: false });
