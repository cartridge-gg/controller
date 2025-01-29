import { useCallback, useEffect, useMemo, useState } from "react";
import { shortString, Signature, TypedData } from "starknet";
import { Container, Footer, Content } from "@/components/layout";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardListContent,
  CardListItem,
} from "@cartridge/ui-next";
import { useController } from "@/hooks/controller";

export function SignMessage({
  origin,
  typedData,
  onSign,
  onCancel,
}: {
  origin: string;
  typedData: TypedData;
  onSign: (sig: Signature) => void;
  onCancel: () => void;
}) {
  const { controller } = useController();
  const [messageData, setMessageData] = useState<TypedData>();

  useEffect(() => {
    if (!typedData) return;
    const primaryTypeData = typedData.types[typedData.primaryType];

    // Recursively decodes all nested `felt*` types
    // to their ASCII equivalents
    const convertFeltArraysToString = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initial: any,
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
    const account = controller;
    if (!account) return;
    const sig = await account.signMessage(typedData);
    onSign(sig);
  }, [controller, onSign, typedData]);

  return (
    <Container
      title="Signature Request"
      description={`${hostname} is asking you to sign a message`}
    >
      {messageData && (
        <Content>
          <div className="flex flex-col w-full gap-4 text-sm">
            {messageData.types[messageData.primaryType].map((typ) => (
              <Card key={typ.name}>
                <CardHeader>
                  <CardTitle>{typ.name}</CardTitle>
                </CardHeader>

                <CardListContent>
                  {(() => {
                    const v =
                      messageData.message[
                        typ.name as keyof typeof messageData.message
                      ];
                    return typeof v === "object" ? (
                      <CardListContent>
                        {Object.entries(v).map(([key, value]) => (
                          <CardListItem className="flex flex-row justify-start gap-2 ">
                            <div className="capitalize text-muted-foreground">
                              {key}:
                            </div>
                            <div className="break-words break-all">
                              {value as string}
                            </div>
                          </CardListItem>
                        ))}
                      </CardListContent>
                    ) : (
                      <CardListItem>{v as string}</CardListItem>
                    );
                  })()}
                </CardListContent>
              </Card>
            ))}
          </div>
        </Content>
      )}

      <Footer>
        <Button onClick={onConfirm}>sign</Button>

        <Button variant="secondary" onClick={onCancel}>
          reject
        </Button>
      </Footer>
    </Container>
  );
}
