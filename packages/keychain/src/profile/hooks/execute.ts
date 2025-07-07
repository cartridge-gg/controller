import { useConnection as useKeychainConnection } from "@/hooks/connection";
import { useCallback } from "react";
import { Call } from "starknet";

export function useExecute() {
  const { setContext } = useKeychainConnection();

  const execute = useCallback(
    async (calls: Call[]): Promise<string> => {
      return new Promise((resolve, reject) => {
        setContext({
          type: "execute",
          transactions: calls,
          resolve: (res: any) => {
            if (res.transaction_hash) {
              resolve(res.transaction_hash);
            } else {
              reject(new Error("No transaction hash returned"));
            }
          },
          reject: (error: any) => {
            reject(error);
          },
        });
      });
    },
    [setContext],
  );

  return { execute };
}
