import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResponseCodes } from "@cartridge/controller";
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
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseSignMessageParams } from "@/utils/connection/sign";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function SignMessage() {
  const { closeModal, setOnModalClose } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<
    ReturnType<typeof parseSignMessageParams>
  >(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsed = parseSignMessageParams(dataParam);
      if (parsed) {
        setParams(parsed);
        return;
      }
    }

    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  useEffect(() => {
    return () => {
      if (params?.params.id) {
        cleanupCallbacks(params.params.id);
      }
    };
  }, [params?.params.id]);

  const returnTo = searchParams.get("returnTo");

  const cancelWithoutClosing = useCallback(() => {
    if (!params) {
      return;
    }

    params.onCancel?.();
    params.resolve?.(CANCEL_RESPONSE);
    cleanupCallbacks(params.params.id);
  }, [params]);

  const handleCompletion = useCallback(() => {
    setOnModalClose?.(undefined);
    if (returnTo) {
      navigate(returnTo, { replace: true });
    } else {
      void closeModal?.();
    }
  }, [returnTo, navigate, closeModal, setOnModalClose]);

  const handleSign = useCallback(
    (signature: Signature) => {
      if (!params) {
        return;
      }

      params.resolve?.(signature);
      cleanupCallbacks(params.params.id);
      handleCompletion();
    },
    [params, handleCompletion],
  );

  const handleCancel = useCallback(() => {
    cancelWithoutClosing();
    handleCompletion();
  }, [cancelWithoutClosing, handleCompletion]);

  useEffect(() => {
    if (!setOnModalClose || !params?.resolve) {
      return;
    }

    setOnModalClose(() => {
      cancelWithoutClosing();
    });

    return () => {
      setOnModalClose(undefined);
    };
  }, [setOnModalClose, params?.resolve, cancelWithoutClosing]);

  const typedData = useMemo(() => params?.params.typedData, [params]);

  if (!typedData) {
    return null;
  }

  return (
    <SignMessageView
      typedData={typedData}
      onSign={handleSign}
      onCancel={handleCancel}
    />
  );
}

export function SignMessageView({
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

    const convertFeltArraysToString = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initial: any,
      messageType: Array<{ name: string; type: string }>,
    ) => {
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
          typedData.types[typeMember.type] &&
          Array.isArray(typedData.types[typeMember.type])
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
