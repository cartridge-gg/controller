import { constants, number } from "starknet";
import { InvocationWithDetails } from "./controller";
import { GATEWAY_GOERLI, GATEWAY_MAINNET } from "./constants";

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
