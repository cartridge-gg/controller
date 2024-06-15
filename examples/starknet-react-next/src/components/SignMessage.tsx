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
  primaryType: "Mail",
  domain: {
    name: "StarkNet Mail",
    version: "1",
    revision: "1",
    chainId: "1",
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
  const [message, setMessage] = useState(MESSAGE);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { signTypedData, data: signature } = useSignTypedData(message);

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
    <div style={{ marginTop: "10px" }}>
      <h2>Sign Message</h2>
      <textarea
        style={{ height: "200px", width: "500px" }}
        value={JSON.stringify(message, null, 2)}
        onChange={(e) => setMessage(JSON.parse(e.target.value))}
      />
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <button
          onClick={() => {
            setIsValid(null);
            signTypedData(message);
          }}
        >
          Sign Message
        </button>

        {signature && (
          <button style={{ paddingLeft: "8px" }} onClick={onValidateSig}>
            Validate Signature
          </button>
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
