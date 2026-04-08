import { useCallback, useState } from "react";
import { useConnection } from "../connection";
import { client } from "@/utils/graphql";

// Manual types since codegen hasn't run yet with the new backend schema

export interface CoinflowOrderResponse {
  sessionKey: string;
  jwtToken: string;
  merchantId: string;
  subtotalCents: number;
  layerswapPayment: {
    cryptoPaymentId: string;
    swapId: string;
    status: string;
    sourceNetwork: string;
    sourceTokenAmount: string;
    sourceTokenAddress: string;
    sourceDepositAddress: string;
    expiresAt: string;
  };
}

export interface CreateCoinflowLayerswapOrderMutation {
  createCoinflowLayerswapOrder: CoinflowOrderResponse;
}

const CreateCoinflowLayerswapOrderDocument = `
  mutation CreateCoinflowLayerswapOrder($input: CreateCoinflowLayerswapOrderInput!) {
    createCoinflowLayerswapOrder(input: $input) {
      sessionKey
      jwtToken
      merchantId
      subtotalCents
      layerswapPayment {
        ...LayerswapPaymentFields
      }
    }
  }

  fragment LayerswapPaymentFields on LayerswapPayment {
    cryptoPaymentId
    swapId
    status
    sourceNetwork
    sourceTokenAmount
    sourceTokenAddress
    sourceDepositAddress
    expiresAt
  }
`;

const useCoinflowPayment = () => {
  const { controller } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMainnet = controller?.chainId() === "0x534e5f4d41494e"; // SN_MAIN

  const createOrder = useCallback(
    async (purchaseUSDCAmount: string) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsLoading(true);
        setError(null);

        const result =
          await client.request<CreateCoinflowLayerswapOrderMutation>(
            CreateCoinflowLayerswapOrderDocument,
            {
              input: {
                purchaseUSDCAmount,
                sandbox: !isMainnet,
              },
            },
          );

        return result.createCoinflowLayerswapOrder;
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [controller, isMainnet],
  );

  return {
    isLoading,
    error,
    createOrder,
    env: isMainnet ? ("prod" as const) : ("sandbox" as const),
  };
};

export default useCoinflowPayment;
