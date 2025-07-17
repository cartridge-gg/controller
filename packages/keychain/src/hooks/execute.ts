import { useConnection as useKeychainConnection } from "@/hooks/connection";
import { useCallback } from "react";
import { Call } from "starknet";
import { ConnectError, ExecuteReply } from "@cartridge/controller";
import { AddInvokeTransactionResult } from "@starknet-io/types-js";

export function useExecute() {
  const { setContext } = useKeychainConnection();

  const execute = useCallback(
    async (calls: Call[]): Promise<AddInvokeTransactionResult> => {
      return new Promise((resolve, reject) => {
        setContext({
          type: "execute",
          transactions: calls,
          resolve: (res: ExecuteReply | ConnectError) => {
            if ("transaction_hash" in res && res.transaction_hash) {
              resolve(res);
            } else {
              reject(new Error("No transaction hash returned"));
            }
          },
          reject: (error: unknown) => {
            reject(error);
          },
        });
      });
    },
    [setContext],
  );

  return { execute };
}
