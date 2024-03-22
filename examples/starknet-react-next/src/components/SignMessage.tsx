import {
  useAccount,
  useContract,
  useSignTypedData,
} from "@starknet-react/core";
import { useState } from "react";
import { typedData } from "starknet";

export function SignMessage() {
  const { address, account } = useAccount();
  const { contract } = useContract({
    address,
  });

  const defaultMessage: typedData.TypedData = {
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
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
      chainId: 1,
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
  const [message, setMessage] = useState(defaultMessage);
  const { signTypedData, data: signature } = useSignTypedData(message);

  const msgHash = typedData.getMessageHash(message, address);

  if (!account) {
    return null;
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <h2>Sign Message</h2>
      <textarea
        style={{ height: "200px", width: "500px" }}
        value={JSON.stringify(message, null, 2)}
        onChange={(e) => setMessage(JSON.parse(e.target.value))}
      />
      <div>
        <button onClick={() => signTypedData(message)}>Sign Message</button>
        {/* 
        // TODO: verify signature https://www.starknetjs.com/docs/guides/signature/#verify-in-the-starknet-network-with-the-account
        
        {signature && (
          <button
            style={{ paddingLeft: "8px" }}
            onClick={async () => {
              const res = await account.callContract(
                {
                  contractAddress: address,
                  entrypoint: "isValidSignature",
                  calldata: [msgHash, signature.length, ...signature],
                },
                "latest",
              );
            }}
          >
            Validate Signature
          </button>
        )} */}
      </div>
      {signature && <div>Signature: {JSON.stringify(signature, null, 2)}</div>}
    </div>
  );
}
