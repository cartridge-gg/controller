import { useCallback, useEffect, useState } from "react";
import { shortString, Signature, TypedData } from "starknet";
import {
  LayoutFooter,
  LayoutContent,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardListContent,
  CardListItem,
  HeaderInner,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
// import { OcclusionDetector } from "@/components/OcclusionDetector";

export function SignMessage({
  typedData,
  onSign,
  onCancel,
}: {
  typedData: TypedData;
  onSign: (sig: Signature) => void;
  onCancel: () => void;
}) {
  const { controller, origin } = useConnection();
  const [messageData, setMessageData] = useState<TypedData>();

  const formatValue = (value: unknown, fieldType?: string): string => {
    if (typeof value === "boolean") {
      return value.toString();
    }

    if (typeof value === "string") {
      if (fieldType === "bool" || fieldType === "boolean") {
        if (value === "0x1" || value === "1") {
          return "true";
        }
        if (value === "0x0" || value === "0") {
          return "false";
        }
      }

      return value;
    }

    return String(value);
  };

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
      // Ensure messageType is actually an array before iterating
      if (!Array.isArray(messageType)) {
        return;
      }
      for (const typeMember of messageType) {
        if (typeMember.type === "felt*") {
          const stringArray: Array<string> = initial[typeMember.name].map(
            (hex: string) => shortString.decodeShortString(hex),
          );
          initial[typeMember.name] = stringArray.join("");
        } else if (
          typedData.types[typeMember.type] && // Check if the type exists as a key in typedData.types
          Array.isArray(typedData.types[typeMember.type]) // And ensure it's an array (a struct definition)
        ) {
          convertFeltArraysToString(
            initial[typeMember.name],
            typedData.types[typeMember.type],
          );
        }
      }
    };

    const messageCopy = JSON.parse(JSON.stringify(typedData.message));
    convertFeltArraysToString(messageCopy, primaryTypeData);

    setMessageData({
      ...typedData,
      message: messageCopy,
    });
  }, [typedData]);

  const onConfirm = useCallback(async () => {
    const account = controller;
    if (!account) return;
    const sig = await account.signMessage(typedData);
    onSign(sig);
  }, [controller, onSign, typedData]);

  return (
    <>
      {/* <OcclusionDetector /> */}
      <HeaderInner
        title="Signature Request"
        description={`${origin} is asking you to sign a message`}
        hideIcon
      />
      <LayoutContent>
        {messageData && (
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
                        {Object.entries(v).map(([key, value]) => {
                          const nestedTypes = messageData.types[typ.type];
                          const fieldType = nestedTypes?.find(
                            (field) => field.name === key,
                          )?.type;

                          return (
                            <CardListItem
                              key={key}
                              className="flex flex-row justify-start gap-2 "
                            >
                              <div className="capitalize text-foreground-400">
                                {key}:
                              </div>
                              <div className="break-words break-all">
                                {formatValue(value, fieldType)}
                              </div>
                            </CardListItem>
                          );
                        })}
                      </CardListContent>
                    ) : (
                      <CardListItem>{formatValue(v, typ.type)}</CardListItem>
                    );
                  })()}
                </CardListContent>
              </Card>
            ))}
          </div>
        )}
      </LayoutContent>

      <LayoutFooter>
        <Button onClick={onConfirm}>sign</Button>

        <Button variant="secondary" onClick={onCancel}>
          reject
        </Button>
      </LayoutFooter>
    </>
  );
}
