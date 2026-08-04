import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  useCoinflowWithdrawStatusQuery,
  useCreateCoinflowBankAuthSessionMutation,
} from "@/utils/api";
import { useConnection } from "@/hooks/connection";
import { useCoinflowIsMainnet } from "./coinflow";
import {
  useCoinflowBankAuthSession,
  useCoinflowWithdrawStatus,
} from "./coinflow-withdraw";

const invalidateQueries = vi.fn();
vi.mock("react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-query")>()),
  useQueryClient: () => ({ invalidateQueries }),
}));
vi.mock("@/hooks/connection", () => ({ useConnection: vi.fn() }));
vi.mock("./coinflow", () => ({ useCoinflowIsMainnet: vi.fn() }));
vi.mock("@/utils/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/api")>()),
  useCoinflowWithdrawStatusQuery: vi.fn(),
  useCreateCoinflowBankAuthSessionMutation: vi.fn(),
}));
vi.mock("@/utils/graphql", () => ({ request: vi.fn() }));

const queryMock = vi.mocked(useCoinflowWithdrawStatusQuery);
const bankAuthMutationMock = vi.mocked(
  useCreateCoinflowBankAuthSessionMutation,
);
const connectionMock = vi.mocked(useConnection);
const isMainnetMock = vi.mocked(useCoinflowIsMainnet);

// The withdrawer status query is the first (and gating) Coinflow off-ramp call. It must
// forward the environment resolved by useCoinflowIsMainnet as its `isMainnet` variable —
// the backend treats false as sandbox. A regression here silently routes the whole flow
// to the wrong Coinflow environment (the live/sandbox mismatch that 401s).
describe("useCoinflowWithdrawStatus", () => {
  afterEach(() => vi.restoreAllMocks());

  const render = (isCoinflowMainnet: boolean) => {
    connectionMock.mockReturnValue({
      controller: {},
    } as unknown as ReturnType<typeof useConnection>);
    isMainnetMock.mockReturnValue({
      isCoinflowMainnet,
      isCoinflowSandbox: !isCoinflowMainnet,
    });
    queryMock.mockReturnValue({ data: undefined } as unknown as ReturnType<
      typeof useCoinflowWithdrawStatusQuery
    >);
    renderHook(() => useCoinflowWithdrawStatus());
  };

  it("threads isMainnet=false (sandbox) into the status query", () => {
    render(false);
    expect(queryMock).toHaveBeenCalledWith(
      { isMainnet: false },
      expect.objectContaining({ retry: false, refetchOnWindowFocus: true }),
    );
  });

  it("threads isMainnet=true (live) into the status query", () => {
    render(true);
    expect(queryMock).toHaveBeenCalledWith(
      { isMainnet: true },
      expect.anything(),
    );
  });
});

// The hosted Bank Authentication UI session must be minted for the same Coinflow
// environment as every other off-ramp op (a live/sandbox mismatch 401s the
// iframe), and the resolved env must ride along so the drawer can hand it to
// CoinflowWithdraw without re-deriving the network.
describe("useCoinflowBankAuthSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    invalidateQueries.mockReset();
  });

  const render = (isCoinflowMainnet: boolean) => {
    isMainnetMock.mockReturnValue({
      isCoinflowMainnet,
      isCoinflowSandbox: !isCoinflowMainnet,
    });
    const mutateAsync = vi.fn().mockResolvedValue({
      createCoinflowBankAuthSession: {
        sessionKey: "sk_test",
        merchantId: "cartridge",
      },
    });
    const reset = vi.fn();
    bankAuthMutationMock.mockReturnValue({
      mutateAsync,
      isLoading: false,
      error: null,
      reset,
    } as unknown as ReturnType<
      typeof useCreateCoinflowBankAuthSessionMutation
    >);
    const { result } = renderHook(() => useCoinflowBankAuthSession());
    return { result, mutateAsync, reset };
  };

  it("mints a sandbox session and carries env=sandbox", async () => {
    const { result, mutateAsync } = render(false);

    await act(async () => {
      await result.current.launch();
    });

    expect(mutateAsync).toHaveBeenCalledWith({ input: { isMainnet: false } });
    expect(result.current.session).toEqual({
      sessionKey: "sk_test",
      merchantId: "cartridge",
      env: "sandbox",
    });
  });

  it("mints a live session and carries env=prod", async () => {
    const { result, mutateAsync } = render(true);

    await act(async () => {
      await result.current.launch();
    });

    expect(mutateAsync).toHaveBeenCalledWith({ input: { isMainnet: true } });
    expect(result.current.session?.env).toBe("prod");
  });

  it("invalidates the status query when the iframe links an account", async () => {
    const { result } = render(false);

    await act(async () => {
      await result.current.onLinked();
    });

    expect(invalidateQueries).toHaveBeenCalledWith(["CoinflowWithdrawStatus"]);
  });

  it("reset clears the held session and the mutation", async () => {
    const { result, reset } = render(false);

    await act(async () => {
      await result.current.launch();
    });
    expect(result.current.session).toBeDefined();

    act(() => {
      result.current.reset();
    });

    expect(result.current.session).toBeUndefined();
    expect(reset).toHaveBeenCalled();
  });
});
