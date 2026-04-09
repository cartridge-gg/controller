import { useCallback, useState } from "react";
import { useConnection } from "../connection";
import { client } from "@/utils/graphql";

// Manual types mirror the backend GraphQL schema. Replace with generated
// types once the backend PR (cartridge-gg/internal#4291) is merged and
// `pnpm build:keychain` runs codegen against the live schema.

export interface CoinflowPricingDetails {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
}

export interface CoinflowStarterpackIntent {
  id: string;
  sessionKey: string;
  jwtToken: string;
  merchantId: string;
  pricing: CoinflowPricingDetails;
}

export interface CreateCoinflowStarterpackIntentInput {
  starterpackId: string;
  quantity: number;
  referral?: string;
  referralGroup?: string;
  registryAddress: string;
  clientPercentage?: number;
  isMainnet?: boolean;
}

interface CreateCoinflowStarterpackIntentMutation {
  createCoinflowStarterpackIntent: CoinflowStarterpackIntent;
}

const CreateCoinflowStarterpackIntentDocument = `
  mutation CreateCoinflowStarterpackIntent($input: CreateCoinflowStarterpackIntentInput!) {
    createCoinflowStarterpackIntent(input: $input) {
      id
      sessionKey
      jwtToken
      merchantId
      pricing {
        baseCostInCents
        processingFeeInCents
        totalInCents
      }
    }
  }
`;

export enum CoinflowPaymentStatus {
  Pending = "PENDING",
  Succeeded = "SUCCEEDED",
  Failed = "FAILED",
}

export enum CoinflowFulfillmentStatus {
  AwaitingPayment = "AWAITING_PAYMENT",
  Queued = "QUEUED",
  Processing = "PROCESSING",
  Submitted = "SUBMITTED",
  Confirmed = "CONFIRMED",
  Failed = "FAILED",
}

export interface CoinflowPaymentPurchaseFulfillment {
  id: string;
  status: CoinflowFulfillmentStatus;
  transactionHash?: string | null;
  lastError?: string | null;
}

export interface CoinflowPayment {
  id: string;
  paymentStatus: CoinflowPaymentStatus;
  purchaseFulfillment?: CoinflowPaymentPurchaseFulfillment | null;
}

export interface CoinflowPaymentQuery {
  coinflowPayment: CoinflowPayment;
}

export const CoinflowPaymentDocument = `
  query CoinflowPayment($id: ID!) {
    coinflowPayment(id: $id) {
      id
      paymentStatus
      purchaseFulfillment {
        id
        status
        transactionHash
        lastError
      }
    }
  }
`;

const useCoinflowPayment = () => {
  const { controller } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMainnet = controller?.chainId() === "0x534e5f4d41494e"; // SN_MAIN

  const createIntent = useCallback(
    async (
      input: Omit<CreateCoinflowStarterpackIntentInput, "isMainnet">,
    ): Promise<CoinflowStarterpackIntent> => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsLoading(true);
        setError(null);

        const result =
          await client.request<CreateCoinflowStarterpackIntentMutation>(
            CreateCoinflowStarterpackIntentDocument,
            {
              input: {
                ...input,
                isMainnet,
              },
            },
          );

        return result.createCoinflowStarterpackIntent;
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
    createIntent,
    env: isMainnet ? ("prod" as const) : ("sandbox" as const),
  };
};

export default useCoinflowPayment;
