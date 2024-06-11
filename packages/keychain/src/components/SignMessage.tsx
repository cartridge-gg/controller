import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { shortString, Signature, TypedData } from "starknet";
import { Container, Banner, Footer, Content } from "components/layout";
import { TransferDuoIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";

export function SignMessage({
  origin,
  typedData,
  onSign,
  onCancel,
  onLogout,
}: {
  origin: string;
  typedData: TypedData;
  onSign: (sig: Signature) => void;
  onCancel: () => void;
  onLogout: () => void;
}) {
  const { controller } = useController();
  const [messageData, setMessageData] = useState<TypedData>();

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

  const hostname = useMemo(() => new URL(origin).hostname, [origin]);

  const onConfirm = useCallback(async () => {
    const account = controller.account;
    const sig = await account.signMessage(typedData);
    onSign(sig);
  }, [controller, onSign, typedData]);

  return (
    <Container onLogout={onLogout}>
      <Banner
        Icon={TransferDuoIcon}
        title="Signature Request"
        description={`${hostname} is asking you to sign a message`}
      />

      <Content>
        <Flex direction="column" align="start" gap="18px" w="full">
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
                      {value as string}
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
      </Content>

      <Footer>
        <Button colorScheme="colorful" onClick={onConfirm}>
          sign
        </Button>

        <Button onClick={onCancel}>reject</Button>
      </Footer>
    </Container>
  );
}

function DataContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Flex
      direction="column"
      align="start"
      w="full"
      bg="solid.primary"
      borderRadius="md"
      css={{
        "> p": {
          padding: "12px",
          fontSize: "13px",
          lineHeight: "16px",
        },
        "> p:first-of-type": {
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.05em",
          lineHeight: "18px",
          textTransform: "uppercase",
          color: "var(--chakra-colors-text-secondaryAccent)",
        },
        "> p:not(p:last-of-type)": {
          borderBottom: "1px solid var(--chakra-colors-solid-bg)",
        },
      }}
    >
      <>
        <Text>{title}</Text>
        {children}
      </>
    </Flex>
  );
}
