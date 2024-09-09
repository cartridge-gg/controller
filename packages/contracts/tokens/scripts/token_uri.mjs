#!/usr/bin/env node

import { RpcProvider, CallData, cairo, shortString } from "starknet";

const rpcUrl = "http://localhost:8001/x/starknet/sepolia";

const avatarAddress =
  "0x56be7d500bd759ac4f96f786f15e9e4702c1ae0582091b20c90546e44ba42fc";

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
