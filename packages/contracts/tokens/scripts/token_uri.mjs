#!/usr/bin/env node

import { RpcProvider, CallData, cairo, shortString } from "starknet";

const rpcUrl = "http://localhost:8001/x/starknet/sepolia";

const avatarAddress =
  "0x771d8cb629f971f99cdb7ad9d0902591fbb26346da7bc998b558f5de189d115";
  
const provider = new RpcProvider({ nodeUrl: `${rpcUrl}` });

const uri  = await provider.callContract({
  contractAddress: avatarAddress, 
  entrypoint: "token_uri",
  calldata: CallData.compile([cairo.uint256(process.argv[2])])
})

const uri_str = uri.slice(1, uri.length).map(i => shortString.decodeShortString(i)).join("")
console.log( uri_str);




