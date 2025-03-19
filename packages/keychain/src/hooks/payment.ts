import { useState, useCallback } from "react";
import {
  CreateCryptoPaymentDocument,
  CreateCryptoPaymentMutation,
  Chain,
} from "@cartridge/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { useConnection } from "./connection";
import { ExternalPlatform } from "@cartridge/controller";

const PLATFORM_TO_CHAIN: Record<ExternalPlatform, Chain | null> = {
  ethereum: Chain.Ethereum,
  solana: Chain.Solana,
  starknet: null, // TODO: Add Starknet
};

const useCryptoPayment = () => {
  const { controller } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createCryptoPayment = useCallback(
    async (credits: number, platform: ExternalPlatform, isMainnet: boolean = false) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await client.request<CreateCryptoPaymentMutation>(
          CreateCryptoPaymentDocument,
          {
            input: {
              username: controller.username(),
              credits,
              chain: PLATFORM_TO_CHAIN[platform],
              isMainnet,
            },
          }
        );

        return result.createCryptoPayment;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [controller]
  );

  return {
    createCryptoPayment,
    isLoading,
    error,
  };
};

export default useCryptoPayment;
