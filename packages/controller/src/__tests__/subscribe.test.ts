import { subscribeCreateSession } from "../session/internal/subscribe";
import { SessionTimeoutError } from "../session/internal/errors";

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const MOCK_SESSION = {
  authorization: ["0x1", "0x2"],
  expiresAt: "1234567890",
  controller: {
    accountID: "testuser",
    address: "0x123",
  },
};

describe("subscribeCreateSession", () => {
  test("returns session on first successful poll", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { subscribeCreateSession: MOCK_SESSION },
      }),
    });

    const result = await subscribeCreateSession("0xguid", "https://api.test");
    expect(result).toEqual(MOCK_SESSION);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("polls until session is available", async () => {
    // First call: null, second call: session
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { subscribeCreateSession: null } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { subscribeCreateSession: MOCK_SESSION },
        }),
      });

    const promise = subscribeCreateSession("0xguid", "https://api.test");

    // Advance past first delay
    await jest.advanceTimersByTimeAsync(600);

    const result = await promise;
    expect(result).toEqual(MOCK_SESSION);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("retries on server error responses", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { subscribeCreateSession: MOCK_SESSION },
        }),
      });

    const promise = subscribeCreateSession("0xguid", "https://api.test");
    await jest.advanceTimersByTimeAsync(600);

    const result = await promise;
    expect(result).toEqual(MOCK_SESSION);
  });

  test("retries on GraphQL errors", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: "temporary error" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { subscribeCreateSession: MOCK_SESSION },
        }),
      });

    const promise = subscribeCreateSession("0xguid", "https://api.test");
    await jest.advanceTimersByTimeAsync(600);

    const result = await promise;
    expect(result).toEqual(MOCK_SESSION);
  });

  test("times out after configured duration", async () => {
    jest.useRealTimers(); // Use real timers for this test — short timeout

    mockFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => ({ data: { subscribeCreateSession: null } }),
    }));

    // Use a very short timeout
    await expect(
      subscribeCreateSession("0xguid", "https://api.test", 500),
    ).rejects.toThrow(SessionTimeoutError);
  }, 15000);

  test("sends correct GraphQL query", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { subscribeCreateSession: MOCK_SESSION },
      }),
    });

    await subscribeCreateSession("0xmyguid", "https://api.test");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.test/query");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.variables.sessionKeyGuid).toBe("0xmyguid");
    expect(body.query).toContain("subscribeCreateSession");
  });

  test("strips trailing slashes from API URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { subscribeCreateSession: MOCK_SESSION },
      }),
    });

    await subscribeCreateSession("0xguid", "https://api.test///");
    expect(mockFetch.mock.calls[0][0]).toBe("https://api.test/query");
  });
});
