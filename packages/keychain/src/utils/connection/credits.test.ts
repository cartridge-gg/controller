import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { creditsFactory } from "./credits";
import { ResponseCodes } from "@cartridge/controller";
import { fetchData } from "@/utils/graphql";
import { CreditDocument } from "@/utils/api";

vi.mock("@/utils/graphql", () => ({
  fetchData: vi.fn(),
}));

describe("creditsFactory", () => {
  const mockController = {
    username: vi.fn(() => "alice"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.controller = mockController as unknown as Window["controller"];
  });

  afterEach(() => {
    window.controller = undefined;
  });

  it("rejects when no controller is connected", async () => {
    window.controller = undefined;

    const credits = creditsFactory();

    await expect(credits()).rejects.toEqual({
      code: ResponseCodes.NOT_CONNECTED,
    });
    expect(fetchData).not.toHaveBeenCalled();
  });

  it("queries the current account's credits and returns the balance", async () => {
    vi.mocked(fetchData).mockResolvedValue({
      account: {
        credits: { amount: "1234000000", decimals: 6 },
      },
    });

    const credits = creditsFactory();

    await expect(credits()).resolves.toBe(1234);
    expect(mockController.username).toHaveBeenCalled();
    expect(fetchData).toHaveBeenCalledWith(CreditDocument, {
      username: "alice",
    });
  });

  it("handles zero-decimal balances", async () => {
    vi.mocked(fetchData).mockResolvedValue({
      account: {
        credits: { amount: "250", decimals: 0 },
      },
    });

    const credits = creditsFactory();

    await expect(credits()).resolves.toBe(250);
  });

  it("returns 0 when the account has no credits", async () => {
    vi.mocked(fetchData).mockResolvedValue({ account: null });

    const credits = creditsFactory();

    await expect(credits()).resolves.toBe(0);
  });

  it("propagates API errors", async () => {
    vi.mocked(fetchData).mockRejectedValue(new Error("network error"));

    const credits = creditsFactory();

    await expect(credits()).rejects.toThrow("network error");
  });
});
