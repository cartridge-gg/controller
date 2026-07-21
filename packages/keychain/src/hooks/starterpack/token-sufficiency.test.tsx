import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { num, uint256 } from "starknet";
import { useTokenSufficiency } from "./token-sufficiency";
import type { OnchainStarterpackDetails } from "@/context/starterpack/types";
import type { TokenOption } from "./token-selection";
import type Controller from "@/utils/controller";

const mocks = vi.hoisted(() => ({
  fetchSwapQuote: vi.fn(),
  isQuoteChain: vi.fn(() => true),
}));

vi.mock("@/utils/ekubo", () => ({
  fetchSwapQuote: mocks.fetchSwapQuote,
  isQuoteChain: mocks.isQuoteChain,
  USDC_ADDRESSES: {},
  USDCE_ADDRESSES: {},
}));

const PAYMENT_TOKEN = "0x1";
const OTHER_TOKEN = "0x2";
const OWNER = "0xowner";

function makeToken(address: string, symbol: string): TokenOption {
  return {
    name: symbol,
    symbol,
    decimals: 18,
    address,
    icon: undefined,
    contract: {} as TokenOption["contract"],
  };
}

const CREDITS: TokenOption = {
  ...makeToken("credits", "USD"),
  isCredits: true,
};

function makeDetails(totalCost: bigint): OnchainStarterpackDetails {
  return {
    type: "onchain",
    id: 1,
    name: "Bundle",
    description: "",
    imageUri: "",
    items: [],
    isQuoteLoading: false,
    isConditional: false,
    quote: {
      basePrice: totalCost,
      referralFee: 0n,
      protocolFee: 0n,
      totalCost,
      paymentToken: PAYMENT_TOKEN,
      paymentTokenMetadata: { symbol: "USDC", decimals: 6 },
    },
  };
}

function makeController(balances: Record<string, bigint | Error>): Controller {
  return {
    address: () => OWNER,
    chainId: () => "0x534e5f4d41494e",
    provider: {
      callContract: vi.fn(async ({ contractAddress }) => {
        const balance = balances[contractAddress];
        if (balance === undefined || balance instanceof Error) {
          throw balance ?? new Error("unknown token");
        }
        const { low, high } = uint256.bnToUint256(balance);
        return [num.toHex(low), num.toHex(high)];
      }),
    },
  } as unknown as Controller;
}

function renderSufficiency(
  controller: Controller,
  tokens: TokenOption[],
  totalCost = 100n,
  quantity = 1,
) {
  // Create the details object once: the hook's effect is keyed on object
  // identity, so a fresh object per render would loop forever.
  const details = makeDetails(totalCost);
  return renderHook(() =>
    useTokenSufficiency({
      controller,
      starterpackDetails: details,
      availableTokens: tokens,
      quantity,
      selectedWallet: undefined,
      walletAddress: undefined,
      selectedPlatform: undefined,
    }),
  );
}

describe("useTokenSufficiency", () => {
  beforeEach(() => {
    mocks.fetchSwapQuote.mockReset();
    mocks.isQuoteChain.mockReturnValue(true);
  });

  it("flags the payment token when its balance is below the total cost", async () => {
    const controller = makeController({ [PAYMENT_TOKEN]: 40n });
    const { result } = renderSufficiency(
      controller,
      [makeToken(PAYMENT_TOKEN, "USDC")],
      100n,
    );

    await waitFor(() => {
      expect(result.current.isCheckingSufficiency).toBe(false);
      expect(
        result.current.insufficientTokens.has(num.toHex(PAYMENT_TOKEN)),
      ).toBe(true);
    });
  });

  it("accounts for quantity when checking the payment token", async () => {
    const controller = makeController({ [PAYMENT_TOKEN]: 150n });
    const { result } = renderSufficiency(
      controller,
      [makeToken(PAYMENT_TOKEN, "USDC")],
      100n,
      2,
    );

    await waitFor(() => {
      expect(result.current.isCheckingSufficiency).toBe(false);
      expect(
        result.current.insufficientTokens.has(num.toHex(PAYMENT_TOKEN)),
      ).toBe(true);
    });
  });

  it("leaves funded tokens enabled and prices other tokens via swap quote", async () => {
    mocks.fetchSwapQuote.mockResolvedValue({ total: 500n });
    const controller = makeController({
      [PAYMENT_TOKEN]: 100n,
      [OTHER_TOKEN]: 499n,
    });
    const { result } = renderSufficiency(controller, [
      makeToken(PAYMENT_TOKEN, "USDC"),
      makeToken(OTHER_TOKEN, "STRK"),
    ]);

    await waitFor(() => {
      expect(result.current.isCheckingSufficiency).toBe(false);
      expect(
        result.current.insufficientTokens.has(num.toHex(PAYMENT_TOKEN)),
      ).toBe(false);
      expect(
        result.current.insufficientTokens.has(num.toHex(OTHER_TOKEN)),
      ).toBe(true);
    });
  });

  it("never flags the credits pseudo-token and tolerates balance errors", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const controller = makeController({
      [PAYMENT_TOKEN]: new Error("rpc down"),
    });
    const { result } = renderSufficiency(controller, [
      makeToken(PAYMENT_TOKEN, "USDC"),
      CREDITS,
    ]);

    await waitFor(() => {
      expect(result.current.isCheckingSufficiency).toBe(false);
    });
    // Unknown balance and credits both stay selectable.
    expect(result.current.insufficientTokens.size).toBe(0);
    consoleWarn.mockRestore();
  });
});
