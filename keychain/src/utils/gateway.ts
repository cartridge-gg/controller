import { StarknetChainId } from "starknet/constants";
import { InvocationWithDetails } from "./account";
import { GATEWAY_GOERLI, GATEWAY_MAINNET } from "./constants";

export async function estimateFeeBulk(chainId: StarknetChainId, invocations: InvocationWithDetails[]) {
    const uri = chainId === StarknetChainId.MAINNET ? GATEWAY_MAINNET : GATEWAY_GOERLI;
    const res = await fetch(uri, {
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
            max_fee: invoke.details.maxFee,
            nonce: invoke.details.nonce,
        }))),
    });
    return res.json();
}
