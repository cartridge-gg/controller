import { request } from "@/utils/graphql";
import {
  CreateCryptoPaymentDocument,
  CryptoPaymentDocument,
  CryptoPaymentStatus,
} from "@/utils/api";

export type CryptoPayment = {
  id: string;
  tokenAmount: string;
  status: CryptoPaymentStatus;
  network: "STARKNET" | "SOLANA";
  tokenAddress: string;
  depositAddress: string;
  expiresAt: string;
};

type CreateCryptoPaymentResult = {
  createCryptoPayment: CryptoPayment;
};

type CryptoPaymentResult = {
  cryptoPayment?: CryptoPayment | null;
};

export type CreateStarknetCryptoPaymentInput = {
  tokenAddress: string;
  tokenAmount: bigint;
  teamId: string;
  isMainnet: boolean;
};

export async function createStarknetCryptoPayment({
  tokenAddress,
  tokenAmount,
  teamId,
  isMainnet,
}: CreateStarknetCryptoPaymentInput): Promise<CryptoPayment> {
  const result = await request<CreateCryptoPaymentResult>(
    CreateCryptoPaymentDocument,
    {
      input: {
        network: "STARKNET",
        tokenAddress,
        tokenAmount: tokenAmount.toString(),
        teamId,
        isMainnet,
      },
    },
  );

  return result.createCryptoPayment;
}

export async function getCryptoPayment(
  id: string,
): Promise<CryptoPayment | null> {
  const result = await request<CryptoPaymentResult>(CryptoPaymentDocument, {
    id,
  });

  return result.cryptoPayment ?? null;
}

export async function waitForCryptoPaymentConfirmation(
  id: string,
  timeoutMs = 120_000,
): Promise<CryptoPayment> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const payment = await getCryptoPayment(id);

    switch (payment?.status) {
      case CryptoPaymentStatus.Confirmed:
        return payment;
      case CryptoPaymentStatus.Failed:
        throw new Error("Payment failed");
      case CryptoPaymentStatus.Expired:
        throw new Error("Payment expired");
      default:
        await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }

  throw new Error(
    "Payment was sent but has not been confirmed yet. Check the team balance again shortly.",
  );
}
