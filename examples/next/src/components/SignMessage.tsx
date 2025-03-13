"use client";

import { Button, Textarea } from "@cartridge/ui-next";
import { useAccount, useSignTypedData } from "@starknet-react/core";
import { useCallback, useState } from "react";
import {
  ArraySignatureType,
  TypedData,
  shortString,
  typedData,
} from "starknet";

const DEFAULT_MESSAGE: TypedData = {
  types: {
    StarknetDomain: [
      { name: "name", type: "shortstring" },
      { name: "version", type: "shortstring" },
      { name: "chainId", type: "shortstring" },
      { name: "revision", type: "shortstring" },
    ],
    Person: [
      { name: "name", type: "felt" },
      { name: "wallet", type: "felt" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "felt" },
    ],
  },
  primaryType: "Mail",
  domain: {
    name: "StarkNet Mail",
    version: "1",
    revision: "1",
    chainId: "SN_SEPOLIA",
  },
  message: {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  },
};

export function SignMessage() {
  const { address, account } = useAccount();
  const [message, setMessage] = useState<TypedData>(DEFAULT_MESSAGE);
  const [messageText, setMessageText] = useState(
    JSON.stringify(DEFAULT_MESSAGE, null, 2),
  );
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { signTypedData, data: signature } = useSignTypedData({
    params: message,
  });

  const handleMessageChange = (text: string) => {
    setMessageText(text);
    try {
      const parsedMessage = JSON.parse(text);
      setMessage(parsedMessage);
      setParseError(null);
    } catch (error) {
      setParseError("Invalid JSON format");
    }
  };

  const onValidateSig = useCallback(async () => {
    if (!account || !address) {
      return;
    }

    setIsValid(null);
    const res = await account.callContract(
      {
        contractAddress: address,
        entrypoint: "is_valid_signature",
        calldata: [
          typedData.getMessageHash(message, address),
          (signature as ArraySignatureType).length,
          ...(signature as ArraySignatureType),
        ],
      },
      "pending",
    );

    setIsValid(res[0] === shortString.encodeShortString("VALID"));
  }, [address, message, signature, account]);

  if (!account || !address) return <></>;

  return (
    <div className="flex flex-col gap-2">
      <h2>Sign Message</h2>
      <Textarea
        className="h-96"
        value={messageText}
        onChange={(e) => handleMessageChange(e.target.value)}
      />
      {parseError && <p className="text-red-500 text-sm">{parseError}</p>}
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setIsValid(null);
            signTypedData(message);
          }}
          disabled={!!parseError}
        >
          Sign Message
        </Button>

        {signature && (
          <Button onClick={onValidateSig}>Validate Signature</Button>
        )}
      </div>

      {signature && (
        <div>
          <p>
            Signature{" "}
            {isValid === null
              ? "not validated"
              : isValid
                ? "is valid"
                : "is invalid"}
          </p>
          <pre>
            <code>{JSON.stringify(signature, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
