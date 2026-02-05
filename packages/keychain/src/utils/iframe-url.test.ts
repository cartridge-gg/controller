import { describe, expect, it } from "vitest";
import { getSafeCoinbasePaymentUrl } from "./iframe-url";

describe("getSafeCoinbasePaymentUrl", () => {
  it("accepts secure coinbase URLs", () => {
    expect(
      getSafeCoinbasePaymentUrl("https://pay.coinbase.com/buy/checkout"),
    ).toBe("https://pay.coinbase.com/buy/checkout");
  });

  it("accepts secure coinbase subdomains", () => {
    expect(
      getSafeCoinbasePaymentUrl(
        "https://commerce.coinbase.com/checkout/abc-123",
      ),
    ).toBe("https://commerce.coinbase.com/checkout/abc-123");
  });

  it("rejects non-https URLs", () => {
    expect(
      getSafeCoinbasePaymentUrl("http://pay.coinbase.com/buy/checkout"),
    ).toBeUndefined();
  });

  it("rejects non-coinbase domains", () => {
    expect(
      getSafeCoinbasePaymentUrl("https://example.com/checkout"),
    ).toBeUndefined();
  });

  it("rejects malformed URLs", () => {
    expect(getSafeCoinbasePaymentUrl("not-a-url")).toBeUndefined();
  });

  it("rejects credentialed URLs", () => {
    expect(
      getSafeCoinbasePaymentUrl(
        "https://user:pass@pay.coinbase.com/buy/checkout",
      ),
    ).toBeUndefined();
  });
});
