"use client";

import { Button } from "@cartridge/ui-next";
import { useAccount } from "@starknet-react/core";
import { useCallback, useState  } from "react";
import { CallData } from "starknet";
import { VRF_CONTRACT_ADDRESS } from "./providers/StarknetProvider";

export const RANDO_CONTRACT_ADDRESS = "0x057e00397c6b8e6b49334316a4eb4d1047e0ad07c290d119234d5f8b1e91774e";

export const Random = () => {
    const { account } = useAccount();
    const [random, setRandom] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const execute = useCallback(async () => {
        if (!account) {
            return;
        }

        setRandom(undefined);
        setLoading(true);
        try {
            const { transaction_hash } = await account.execute([
                {
                    contractAddress: VRF_CONTRACT_ADDRESS,
                    entrypoint: "request_random",
                    calldata: CallData.compile({
                        caller: RANDO_CONTRACT_ADDRESS,
                        source: { type: 0, address: account.address },
                    }),
                },
                {
                    contractAddress: RANDO_CONTRACT_ADDRESS,
                    entrypoint: "request",
                }
            ]);
    
            const receipt = await account.waitForTransaction(transaction_hash, {retryInterval: 500});
    
            if (receipt.isSuccess()) {
                setRandom(receipt.events[2].data[0] as string);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [account])

    return (
        <>
            {account && <div>
            <Button onClick={execute} disabled={loading}>{loading ? "Loading..." : "Request Random"}</Button>
            {random && <p>{random}</p>}
        </div>}
        
        </>
    )
}