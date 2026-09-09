import { createRateLimitedFetch, parseRetryAfter } from "../rate-limit";

describe("rate-limited fetch", () => {
  test("retries HTTP 429 responses", async () => {
    const sleeps: number[] = [];
    const baseFetch = jest
      .fn()
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    const rateLimitedFetch = createRateLimitedFetch(
      {
        sleep: async (delay) => {
          sleeps.push(delay);
        },
        random: () => 1,
      },
      baseFetch as typeof fetch,
    );

    const response = await rateLimitedFetch("https://rpc.example", {
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(baseFetch).toHaveBeenCalledTimes(2);
    expect(sleeps).toEqual([500]);
  });

  test("retries JSON-RPC rate-limit errors returned with HTTP 200", async () => {
    const baseFetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            error: { code: -32005, message: "rate limit exceeded" },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "ok" })),
      );
    const rateLimitedFetch = createRateLimitedFetch(
      {
        sleep: async () => {},
        random: () => 1,
      },
      baseFetch as typeof fetch,
    );

    const response = await rateLimitedFetch("https://rpc.example", {
      method: "POST",
    });
    const body = await response.json();

    expect(body.result).toBe("ok");
    expect(baseFetch).toHaveBeenCalledTimes(2);
  });

  test("honors Retry-After seconds", async () => {
    expect(parseRetryAfter("2")).toBe(2000);
  });

  test("does not retry non-idempotent transaction submission methods", async () => {
    const baseFetch = jest
      .fn()
      .mockResolvedValue(new Response("rate limited", { status: 429 }));
    const rateLimitedFetch = createRateLimitedFetch(
      {
        sleep: async () => {},
        random: () => 1,
      },
      baseFetch as typeof fetch,
    );

    const response = await rateLimitedFetch("https://rpc.example", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "starknet_addInvokeTransaction",
        params: [],
      }),
    });

    expect(response.status).toBe(429);
    expect(baseFetch).toHaveBeenCalledTimes(1);
  });

  test("does not retry abort errors", async () => {
    const error = new DOMException("Aborted", "AbortError");
    const baseFetch = jest.fn().mockRejectedValue(error);
    const rateLimitedFetch = createRateLimitedFetch(
      {},
      baseFetch as typeof fetch,
    );

    await expect(rateLimitedFetch("https://rpc.example")).rejects.toBe(error);
    expect(baseFetch).toHaveBeenCalledTimes(1);
  });
});
