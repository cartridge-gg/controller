import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayerControlsSection } from "./player-controls-section";
import { PlayerControlsPeriod } from "@/utils/api";

const mocks = vi.hoisted(() => ({
  queryData: undefined as unknown,
  queryState: { isLoading: false, isError: false, error: undefined },
  mutate: vi.fn(),
  invalidateQueries: vi.fn(),
  invalidatePlayerControlsCache: vi.fn(),
  mutationOptions: undefined as
    | { onSuccess?: () => void; onError?: (err: unknown) => void }
    | undefined,
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    controller: { address: () => "0xcontroller" },
  }),
}));

vi.mock("react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
  };
});

vi.mock("@/utils/connection/spend-enforcement", () => ({
  invalidatePlayerControlsCache: mocks.invalidatePlayerControlsCache,
}));

vi.mock("@/utils/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/api")>();
  return {
    ...actual,
    usePlayerControlsQuery: (
      _variables: unknown,
      options: { select?: (data: unknown) => unknown },
    ) => {
      const data = options?.select
        ? options.select({ playerControls: mocks.queryData })
        : mocks.queryData;
      return { data, ...mocks.queryState };
    },
    useUpdatePlayerControlsMutation: (
      options: typeof mocks.mutationOptions,
    ) => {
      mocks.mutationOptions = options;
      return { mutate: mocks.mutate, isLoading: false };
    },
  };
});

const baseLimit = {
  amountCents: null,
  usedCents: 0,
  pendingAmountCents: null,
  pendingRemoval: false,
};

function pc(overrides: Record<string, unknown> = {}) {
  return {
    period: PlayerControlsPeriod.Monthly,
    windowStart: "2026-07-01T00:00:00Z",
    playTimeMaxDurationSeconds: null,
    pendingPlayTimeMaxDurationSeconds: null,
    pendingPlayTimeRemoval: false,
    pendingPeriod: null,
    pendingEffectiveAt: null,
    creditsPurchase: { ...baseLimit },
    entryPurchase: { ...baseLimit },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.queryData = pc();
  mocks.queryState = { isLoading: false, isError: false, error: undefined };
  mocks.mutationOptions = undefined;
});

describe("PlayerControlsSection", () => {
  it("shows no pending-period line when there is no pending period change", () => {
    render(<PlayerControlsSection />);
    expect(screen.queryByText(/Pending change to/)).not.toBeInTheDocument();
  });

  it("surfaces a pending period change and its effective date without misleadingly applying it", () => {
    mocks.queryData = pc({
      period: PlayerControlsPeriod.Monthly,
      pendingPeriod: PlayerControlsPeriod.Daily,
      pendingEffectiveAt: "2099-01-01T00:00:00Z",
    });

    render(<PlayerControlsSection />);

    // The pending change is surfaced...
    expect(screen.getByText("Pending change to Daily")).toBeVisible();
    // ...alongside when it takes effect.
    expect(screen.getByText(/Pending changes take effect/)).toBeVisible();
    // The reporting period shown in the trigger is still the *effective*
    // (still-Monthly) one, not the pending Daily value — the combobox's
    // accessible value should never read "Daily" while the change is only
    // pending.
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveTextContent(/Monthly|Limit period/);
    expect(combobox).not.toHaveTextContent("Daily");
  });

  it("invalidates the spend-enforcement cache and refetches on a successful mutation", () => {
    mocks.queryData = pc();
    render(<PlayerControlsSection />);

    expect(mocks.mutationOptions?.onSuccess).toBeTypeOf("function");
    mocks.mutationOptions?.onSuccess?.();

    expect(mocks.invalidateQueries).toHaveBeenCalledWith(["PlayerControls"]);
    expect(mocks.invalidatePlayerControlsCache).toHaveBeenCalledWith(
      "0xcontroller",
    );
  });
});
