"use client";

import { Button, Textarea } from "@cartridge/ui";
import { useAccount, useSignTypedData } from "@starknet-react/core";
import { useCallback, useState } from "react";
import {
  ArraySignatureType,
  TypedData,
  shortString,
  typedData,
} from "starknet";

const MESSAGE: TypedData = {
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
  primaryType: "StarknetDomain",
  domain: {
    name: "StarkNet Mail",
    version: "1",
    revision: "1",
    chainId: "SN_SEPOLIA",
  },
  message: {
    name: "My DApp",
    version: "1.0",
    chainId: "SN_SEPOLIA",
    revision: "1",
  },
};

export function SignMessage() {
  const { address, account } = useAccount();
  const [message, setMessage] = useState(MESSAGE);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { signTypedData, data: signature } = useSignTypedData({
    params: message,
  });

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
        value={JSON.stringify(message, null, 2)}
        onChange={(e) => setMessage(JSON.parse(e.target.value))}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setIsValid(null);
            signTypedData(message);
          }}
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
