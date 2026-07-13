import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCoinflowWithdrawStatusQuery } from "@/utils/api";
import { useConnection } from "@/hooks/connection";
import { useCoinflowIsMainnet } from "./coinflow";
import { useCoinflowWithdrawStatus } from "./coinflow-withdraw";

vi.mock("@/hooks/connection", () => ({ useConnection: vi.fn() }));
vi.mock("./coinflow", () => ({ useCoinflowIsMainnet: vi.fn() }));
vi.mock("@/utils/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/api")>()),
  useCoinflowWithdrawStatusQuery: vi.fn(),
}));
vi.mock("@/utils/graphql", () => ({ request: vi.fn() }));

const queryMock = vi.mocked(useCoinflowWithdrawStatusQuery);
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
