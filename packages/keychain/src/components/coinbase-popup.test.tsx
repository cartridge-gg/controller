import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CoinbasePopup } from "./coinbase-popup";

const paymentLink = "https://pay.coinbase.com/buy";
const orderId = "test-order-id";

function renderPopup() {
  return render(
    <MemoryRouter
      initialEntries={[
        `/coinbase?paymentLink=${encodeURIComponent(paymentLink)}&orderId=${orderId}`,
      ]}
    >
      <CoinbasePopup />
    </MemoryRouter>,
  );
}

async function dispatchCoinbaseMessage(data: string) {
  await act(async () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://pay.coinbase.com",
        data,
      }),
    );
  });
}

/** Helper to listen on the BroadcastChannel the popup opens */
function listenOnChannel() {
  const channel = new BroadcastChannel(`coinbase-payment-${orderId}`);
  const messages: unknown[] = [];
  channel.onmessage = (event: MessageEvent) => messages.push(event.data);
  return { channel, messages };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CoinbasePopup", () => {
  it("handles stringified load_success postMessage", async () => {
    const { container } = renderPopup();

    // Loading overlay is visible before Coinbase reports load success.
    expect(container.querySelector("div.z-10")).toBeInTheDocument();

    await dispatchCoinbaseMessage('{"eventName":"onramp_api.load_success"}');

    await waitFor(() => {
      expect(container.querySelector("div.z-10")).not.toBeInTheDocument();
    });
  });

  it("shows Coinbase polling_error message from stringified payload", async () => {
    renderPopup();

    const errorMessage =
      "There was a problem with your payment. Your card has not been charged. Please use a different debit card or try again later.";

    await dispatchCoinbaseMessage(
      JSON.stringify({
        eventName: "onramp_api.polling_error",
        data: {
          errorCode: "ERROR_CODE_GUEST_TRANSACTION_BUY_FAILED",
          errorMessage,
        },
      }),
    );

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it("handles stringified pre-commit Apple Pay progress events", async () => {
    renderPopup();

    await dispatchCoinbaseMessage(
      '{"eventName":"onramp_api.apple_pay_button_pressed"}',
    );
    expect(
      await screen.findByText("Payment processing..."),
    ).toBeInTheDocument();

    await dispatchCoinbaseMessage(
      '{"eventName":"onramp_api.pending_payment_auth"}',
    );
    expect(
      await screen.findByText("Payment processing..."),
    ).toBeInTheDocument();
  });

  it("handles stringified cancel event", async () => {
    renderPopup();

    await dispatchCoinbaseMessage(
      '{"eventName":"onramp_api.apple_pay_button_pressed"}',
    );
    expect(
      await screen.findByText("Payment processing..."),
    ).toBeInTheDocument();

    await dispatchCoinbaseMessage('{"eventName":"onramp_api.cancel"}');

    expect(
      await screen.findByText("Payment was cancelled."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Payment processing...")).not.toBeInTheDocument();
  });

  it("relays Coinbase events via BroadcastChannel", async () => {
    const { channel, messages } = listenOnChannel();

    renderPopup();

    await dispatchCoinbaseMessage('{"eventName":"onramp_api.load_success"}');
    await dispatchCoinbaseMessage('{"eventName":"onramp_api.commit_success"}');

    // BroadcastChannel delivery is async; wait briefly
    await waitFor(() => {
      expect(messages).toHaveLength(2);
    });

    expect(messages[0]).toEqual({
      type: "onramp_api.load_success",
      data: undefined,
    });
    expect(messages[1]).toEqual({
      type: "onramp_api.commit_success",
      data: undefined,
    });

    channel.close();
  });
});
