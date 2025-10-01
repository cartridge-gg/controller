"use client";

import { Button, Textarea } from "@cartridge/ui";
import { useAccount, useSignTypedData } from "@starknet-react/core";
import { useCallback, useState } from "react";
import {
  ArraySignatureType,
  BlockTag,
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
      { name: "name", type: "shortstring" },
      { name: "wallet", type: "ContractAddress" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "shortstring" },
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
      name: "Alice",
      wallet:
        "0x028c7e5b0b0c6927a7c5b7e5d7f5c8e3d3c2b1a0928374655463728394a5b6c7",
    },
    to: {
      name: "Bob",
      wallet:
        "0x038c7e5b0b0c6927a7c5b7e5d7f5c8e3d3c2b1a0928374655463728394a5b6c8",
    },
    contents: "Hello Bob!",
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
    try {
      const msgHash = typedData.getMessageHash(message, address);
      const res = await account.callContract(
        {
          contractAddress: address,
          entrypoint: "is_valid_signature",
          calldata: [
            msgHash,
            (signature as ArraySignatureType).length,
            ...(signature as ArraySignatureType),
          ],
        },
        BlockTag.PRE_CONFIRMED,
      );

      setIsValid(res[0] === shortString.encodeShortString("VALID"));
    } catch (error) {
      console.error("Validation error:", error);
      setIsValid(false);
    }
  }, [address, message, signature, account]);

  const openSignMessageModal = useCallback(() => {
    const params = {
      id: `sign-message-${Date.now()}`,
      typedData: message,
    };
    // Opens the keychain sign message route
    const keychainUrl =
      process.env.NEXT_PUBLIC_KEYCHAIN_URL || "http://localhost:3001";
    const url = `${keychainUrl}/sign-message?data=${encodeURIComponent(JSON.stringify(params))}`;
    window.open(url, "_blank", "width=400,height=600");
  }, [message]);

  if (!account || !address) return <></>;

  return (
    <div className="flex flex-col gap-2">
      <h2>Sign Message</h2>
      <Textarea
        className="h-96"
        value={JSON.stringify(message, null, 2)}
        onChange={(e) => setMessage(JSON.parse(e.target.value))}
      />
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => {
            setIsValid(null);
            signTypedData(message);
          }}
        >
          Sign Message
        </Button>

        <Button variant="secondary" onClick={openSignMessageModal}>
          Open in Modal
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
