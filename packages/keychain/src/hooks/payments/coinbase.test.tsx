import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CoinbaseOnrampStatus } from "@/utils/api";
import { request } from "@/utils/graphql";
import { useCoinbase } from "./coinbase";

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    controller: { chainId: () => "SN_MAIN" },
    isMainnet: true,
  }),
}));

vi.mock("@/utils/graphql", () => ({
  request: vi.fn(),
}));

const requestMock = vi.mocked(request);

describe("useCoinbase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    requestMock.mockReset();
    requestMock.mockResolvedValue({
      createCoinbaseLayerswapOrder: {
        coinbaseOrder: {
          orderId: "order-1",
          paymentLink: "https://pay.coinbase.com/buy",
        },
        layerswapPayment: {
          swapId: "swap-1",
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("clears a stale failed attempt when the same popup later succeeds", async () => {
    const popup = {
      closed: false,
      close: vi.fn(() => {
        popup.closed = true;
      }),
    };
    vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);

    const { result, unmount } = renderHook(() =>
      useCoinbase({ onError: vi.fn() }),
    );

    await act(async () => {
      await result.current.createOrder({ purchaseUSDCAmount: "2.000000" });
    });

    act(() => {
      result.current.openPaymentPopup();
    });

    act(() => {
      dispatchCoinbaseRelay("onramp_api.polling_error", {
        errorMessage: "First attempt failed",
      });
    });

    await waitFor(() => {
      expect(result.current.orderStatus).toBe(CoinbaseOnrampStatus.Failed);
    });

    act(() => {
      dispatchCoinbaseRelay("onramp_api.apple_pay_button_pressed");
    });

    await waitFor(() => {
      expect(result.current.orderStatus).toBeUndefined();
    });

    act(() => {
      dispatchCoinbaseRelay("onramp_api.polling_success");
    });

    await waitFor(() => {
      expect(result.current.paymentSuccess).toBe(true);
      expect(result.current.orderStatus).toBeUndefined();
    });
    expect(popup.close).toHaveBeenCalled();

    act(() => {
      dispatchCoinbaseRelay("onramp_api.polling_error", {
        errorMessage: "Late stale error",
      });
    });

    expect(result.current.paymentSuccess).toBe(true);
    expect(result.current.orderStatus).not.toBe(CoinbaseOnrampStatus.Failed);

    unmount();
  });

  it("does not treat native payment sheet cancellation as an order failure", async () => {
    vi.spyOn(window, "open").mockReturnValue({
      closed: false,
      close: vi.fn(),
    } as unknown as Window);
    const onError = vi.fn();

    const { result, unmount } = renderHook(() => useCoinbase({ onError }));

    await act(async () => {
      await result.current.createOrder({ purchaseUSDCAmount: "2.000000" });
    });

    act(() => {
      result.current.openPaymentPopup();
    });

    act(() => {
      dispatchCoinbaseRelay("onramp_api.cancel");
    });

    expect(result.current.orderStatus).toBeUndefined();
    expect(result.current.popupClosed).toBe(false);
    expect(onError).not.toHaveBeenCalled();

    unmount();
  });

  it("clears a completed session before starting a fresh purchase", async () => {
    vi.spyOn(window, "open").mockReturnValue({
      closed: false,
      close: vi.fn(),
    } as unknown as Window);

    const { result, unmount } = renderHook(() =>
      useCoinbase({ onError: vi.fn() }),
    );

    await act(async () => {
      await result.current.createOrder({ purchaseUSDCAmount: "2.000000" });
    });

    expect(result.current.orderId).toBe("order-1");
    expect(result.current.paymentLink).toBe("https://pay.coinbase.com/buy");

    act(() => {
      result.current.openPaymentPopup();
    });

    act(() => {
      dispatchCoinbaseRelay("onramp_api.polling_success");
    });

    await waitFor(() => {
      expect(result.current.paymentSuccess).toBe(true);
    });

    act(() => {
      result.current.resetOrder();
    });

    expect(result.current.orderId).toBeUndefined();
    expect(result.current.paymentLink).toBeUndefined();
    expect(result.current.orderStatus).toBeUndefined();
    expect(result.current.orderTxHash).toBeUndefined();
    expect(result.current.popupClosed).toBe(false);
    expect(result.current.paymentSuccess).toBe(false);

    unmount();
  });
});

function dispatchCoinbaseRelay(
  type: string,
  data?: { errorMessage?: string; errorCode?: string },
) {
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: window.location.origin,
      data: {
        __coinbase_relay: true,
        type,
        data,
      },
    }),
  );
}
