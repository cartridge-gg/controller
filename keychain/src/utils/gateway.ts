import { constants, number } from "starknet";
import { InvocationWithDetails } from "./controller";
import { GATEWAY_GOERLI, GATEWAY_MAINNET, ETH_RPC_MAINNET, ETH_RPC_GOERLI } from "./constants";

export async function estimateFeeBulk(chainId: constants.StarknetChainId, invocations: InvocationWithDetails[]) {
    const uri = chainId === constants.StarknetChainId.MAINNET ? GATEWAY_MAINNET : GATEWAY_GOERLI;
    const res = await fetch(uri + "/estimate_fee_bulk", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(invocations.map(invoke => ({
            type: "INVOKE_FUNCTION",
            version: "0x1",
            contract_address: invoke.invocation.contractAddress,
            calldata: invoke.invocation.calldata,
            signature: invoke.invocation.signature,
            max_fee: number.toHex(invoke.details.maxFee),
            nonce: invoke.details.nonce,
        }))),
    });
    return res.json();
}

export async function getGasPrice(chainId: constants.StarknetChainId) {
    const uri = chainId === constants.StarknetChainId.MAINNET ? ETH_RPC_MAINNET : ETH_RPC_GOERLI;
    const response = await fetch(uri, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_gasPrice",
            params: [],
            id: 1,
        }),
    });
    const data = await response.json();
    return data.result;
}
