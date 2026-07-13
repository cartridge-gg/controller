import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useConnection } from "../connection";
import { useFeature } from "../features";
import useCoinflowPayment, {
  useCoinflowCreditsPayment,
  useCoinflowIsMainnet,
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

vi.mock("../connection", () => ({ useConnection: vi.fn() }));
vi.mock("../features", () => ({ useFeature: vi.fn() }));

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

const connectionMock = vi.mocked(useConnection);
const featureMock = vi.mocked(useFeature);

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
    connectionMock.mockReturnValue({
      controller: { username: () => "testuser" },
      isMainnet: true,
    } as unknown as ReturnType<typeof useConnection>);
    featureMock.mockReturnValue(false);
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

// useCoinflowIsMainnet is the single source of truth for the Coinflow environment:
// isCoinflowMainnet = connected-to-mainnet AND the "coinflow-sandbox" flag is OFF.
// Everything Coinflow (withdraw status/quote/KYC, card form env) derives sandbox
// from its negation, so this is the linchpin the whole off-ramp flow rides on.
describe("useCoinflowIsMainnet", () => {
  afterEach(() => vi.restoreAllMocks());

  const setup = (isMainnet: boolean, sandboxFlag: boolean) => {
    connectionMock.mockReturnValue({
      isMainnet,
    } as unknown as ReturnType<typeof useConnection>);
    featureMock.mockImplementation((name) =>
      name === "coinflow-sandbox" ? sandboxFlag : false,
    );
    return renderHook(() => useCoinflowIsMainnet()).result.current;
  };

  it("mainnet chain + sandbox flag OFF → live (mainnet)", () => {
    const r = setup(true, false);
    expect(r.isCoinflowMainnet).toBe(true);
    expect(r.isCoinflowSandbox).toBe(false);
  });

  it("mainnet chain + sandbox flag ON → sandbox (flag forces it)", () => {
    const r = setup(true, true);
    expect(r.isCoinflowMainnet).toBe(false);
    expect(r.isCoinflowSandbox).toBe(true);
  });

  it("non-mainnet chain → always sandbox, regardless of the flag", () => {
    expect(setup(false, false).isCoinflowSandbox).toBe(true);
    expect(setup(false, true).isCoinflowSandbox).toBe(true);
  });
});
