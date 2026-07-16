import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useCoinflowPayment, {
  useCoinflowCreditsPayment,
  useCoinflowStarterpackQuote,
} from "./coinflow";

const mocks = vi.hoisted(() => ({
  geo: {
    countryCode: "US",
    regionCode: "US-CA",
    isUS: true,
    countryCodeLoaded: true,
    isLoading: false,
    isError: false,
    error: null,
  },
  createStarterpackIntent: vi.fn(),
  createCreditsIntent: vi.fn(),
  queryStarterpackQuote: vi.fn(),
}));

vi.mock("../connection", () => ({
  useConnection: () => ({
    controller: { username: () => "testuser" },
    isMainnet: true,
  }),
}));

vi.mock("../features", () => ({
  useFeature: () => false,
}));

vi.mock("../geo", () => ({
  useGeoLocation: () => mocks.geo,
}));

vi.mock("@/utils/graphql", () => ({
  request: vi.fn(),
}));

vi.mock("@/utils/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/api")>();
  return {
    ...actual,
    useCreateCoinflowStarterpackIntentMutation: () => ({
      mutateAsync: mocks.createStarterpackIntent,
      isLoading: false,
    }),
    useCreateCoinflowCreditsIntentMutation: () => ({
      mutateAsync: mocks.createCreditsIntent,
      isLoading: false,
    }),
    useCoinflowStarterpackQuoteQuery: (...args: unknown[]) => {
      mocks.queryStarterpackQuote(...args);
      return { data: undefined, isLoading: false };
    },
  };
});

describe("Coinflow US availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.geo, {
      countryCode: "US",
      regionCode: "US-CA",
      isUS: true,
      countryCodeLoaded: true,
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.createStarterpackIntent.mockResolvedValue({
      createCoinflowStarterpackIntent: { id: "payment-1" },
    });
    mocks.createCreditsIntent.mockResolvedValue({
      createCoinflowCreditsIntent: { id: "payment-2" },
    });
  });

  it("creates a starterpack card intent for a US user", async () => {
    const { result } = renderHook(() => useCoinflowPayment());

    await act(async () => {
      await result.current.createIntent({
        starterpackId: "1",
        quantity: 1,
        registryAddress: "0x123",
      });
    });

    expect(mocks.createStarterpackIntent).toHaveBeenCalledOnce();
  });

  it("rejects starterpack and credits card intents outside the US", async () => {
    Object.assign(mocks.geo, {
      countryCode: "CA",
      regionCode: "CA-ON",
      isUS: false,
    });
    const starterpack = renderHook(() => useCoinflowPayment());
    const credits = renderHook(() => useCoinflowCreditsPayment());

    await act(async () => {
      await expect(
        starterpack.result.current.createIntent({
          starterpackId: "1",
          quantity: 1,
          registryAddress: "0x123",
        }),
      ).rejects.toThrow(
        "Credit card checkout is only available in the United States.",
      );
      await expect(
        credits.result.current.createIntent({ amount: 10, decimals: 0 }),
      ).rejects.toThrow(
        "Credit card checkout is only available in the United States.",
      );
    });

    expect(mocks.createStarterpackIntent).not.toHaveBeenCalled();
    expect(mocks.createCreditsIntent).not.toHaveBeenCalled();
  });

  it("does not fetch Coinflow quotes outside the US", () => {
    Object.assign(mocks.geo, {
      countryCode: "FR",
      regionCode: null,
      isUS: false,
    });

    renderHook(() =>
      useCoinflowStarterpackQuote({
        starterpackId: "1",
        quantity: 1,
        registryAddress: "0x123",
      }),
    );

    expect(mocks.queryStarterpackQuote).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ enabled: false }),
    );
  });
});
