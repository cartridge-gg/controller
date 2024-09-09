#!/usr/bin/env node

import { RpcProvider, CallData, cairo, shortString } from "starknet";

const rpcUrl = "http://localhost:8001/x/starknet/sepolia";

const avatarAddress =
  "0x63735a2869d362487b442c87050cb2e10c3759864fbef304968fb58b622b78c";

const provider = new RpcProvider({ nodeUrl: `${rpcUrl}` });

const uri = await provider.callContract({
  contractAddress: avatarAddress,
  entrypoint: "token_uri",
  calldata: CallData.compile([cairo.uint256(process.argv[2])]),
});

const uri_str = uri
  .slice(1, uri.length)
  .map((i) => shortString.decodeShortString(i))
  .join("");
console.log(uri_str);
