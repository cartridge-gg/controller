import { expect, test, type Frame, type Page } from "@playwright/test";

const versions = ["0.13.12", "0.13.13", "0.14.0-alpha.1"] as const;

async function openHost(
  page: Page,
  version: (typeof versions)[number],
  query = "",
) {
  await page.goto(`/${version}/${query}`);
  await page.waitForFunction(
    () =>
      typeof (window as any).__controllerBrowserContract?.ready === "function",
  );
  await page.evaluate(() =>
    (window as any).__controllerBrowserContract.ready(),
  );
  const frame = page
    .frames()
    .find((candidate) =>
      candidate.url().startsWith("http://127.0.0.1:4174/compat.html"),
    );
  if (!frame) throw new Error("Cross-origin keychain iframe did not load");
  await frame.waitForFunction(
    () =>
      typeof (window as any).__keychainBrowserContract?.getState === "function",
  );
  return frame;
}

const hostCall = (page: Page, method: string) =>
  page.evaluate(
    async (name) => await (window as any).__controllerBrowserContract[name](),
    method,
  );

const keychainCall = (frame: Frame, method: string, ...args: unknown[]) =>
  frame.evaluate(
    async ({ name, values }) =>
      await (window as any).__keychainBrowserContract[name](...values),
    { name: method, values: args },
  );

for (const version of versions) {
  test(`${version}: real SDK drives the v10 keychain method table over Penpal`, async ({
    page,
  }) => {
    const frame = await openHost(page, version);
    const initialState = await keychainCall(frame, "getState");

    expect(await hostCall(page, "probe")).toBeNull();
    expect(await hostCall(page, "connectInvocation")).toBe(
      version === "0.13.12" ? "auth-options-array" : "connect-options",
    );
    expect(await hostCall(page, "connectCurrent")).toEqual({
      address:
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
    });

    const connectedState = (await keychainCall(frame, "getState")) as any;
    const connectEvent = connectedState.events.find(
      (event: any) => event.name === "connect",
    );
    expect(connectEvent.args.origin).toBe("http://127.0.0.1:4173");
    expect(connectEvent.args.signupOptions).toEqual(["password"]);

    expect(await hostCall(page, "switchChain")).toBe(true);
    expect(await hostCall(page, "execute")).toMatchObject({
      code: "SUCCESS",
      transaction_hash: "0xabc123",
    });
    expect(await hostCall(page, "sign")).toEqual(["0x111", "0x222"]);
    expect(await hostCall(page, "updateSession")).toMatchObject({
      code: "SUCCESS",
      address:
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
    });

    const feeClone = await page.evaluate(async () => {
      const value = await (
        window as any
      ).__controllerBrowserContract.estimateFee();
      return {
        value,
        plain: Object.getPrototypeOf(value) === Object.prototype,
      };
    });
    expect(feeClone).toEqual({
      plain: true,
      value: {
        l1_gas_consumed: "0x1",
        l1_gas_price: "0x2",
        l2_gas_consumed: "0x3",
        l2_gas_price: "0x4",
        l1_data_gas_consumed: "0x5",
        l1_data_gas_price: "0x6",
        overall_fee: "0x2a",
        unit: "FRI",
      },
    });

    const reverse = (await keychainCall(frame, "runReverseBridge")) as any;
    expect(reverse.detected).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "metamask", available: true }),
      ]),
    );
    expect(reverse.connected).toMatchObject({
      success: true,
      wallet: "metamask",
    });
    expect(reverse.signed).toMatchObject({
      success: true,
      result: "0xexternal-signature",
    });
    expect(reverse.typedSigned).toMatchObject({
      success: true,
      result: "0xexternal-typed-signature",
    });
    expect(reverse.sent).toMatchObject({
      success: true,
      result: "0xexternal",
    });
    expect(reverse.balance).toMatchObject({ success: true, result: "0x2a" });
    expect(reverse.switched).toBe(true);
    expect(reverse.waited).toMatchObject({
      success: true,
      result: { transactionHash: "0xexternal", status: "0x1" },
    });

    await keychainCall(frame, "setMode", "error");
    const errorClone = await page.evaluate(async () => {
      const value = await (
        window as any
      ).__controllerBrowserContract.executeRaw();
      return {
        value,
        plain: Object.getPrototypeOf(value) === Object.prototype,
        errorPlain: Object.getPrototypeOf(value.error) === Object.prototype,
      };
    });
    expect(errorClone).toEqual({
      plain: true,
      errorPlain: true,
      value: {
        code: "ERROR",
        message: "deterministic execution error",
        error: {
          code: 777,
          message: "deterministic execution error",
          data: { reason: "compat-failure", retryable: false },
        },
      },
    });
    await keychainCall(frame, "setMode", "success");

    await keychainCall(frame, "setMode", "cancel");
    const cancelClone = await page.evaluate(async () => {
      const value = await (
        window as any
      ).__controllerBrowserContract.updateSession();
      return {
        value,
        plain: Object.getPrototypeOf(value) === Object.prototype,
      };
    });
    expect(cancelClone).toEqual({
      plain: true,
      value: {
        code: "CANCELED",
        message: "deterministic cancellation",
      },
    });
    await keychainCall(frame, "setMode", "success");

    const disconnect = await hostCall(page, "disconnect");
    expect(disconnect).toMatchObject({ resolved: true });
    await expect
      .poll(async () => {
        const reloadedFrame = page
          .frames()
          .find((candidate) =>
            candidate.url().startsWith("http://127.0.0.1:4174/compat.html"),
          );
        if (!reloadedFrame) return 0;
        try {
          const state = await keychainCall(reloadedFrame, "getState");
          return (state as any).bootCount;
        } catch {
          return 0;
        }
      })
      .toBeGreaterThan((initialState as any).bootCount);
  });

  test(`${version}: legacy positional connect remains structured-clone compatible`, async ({
    page,
  }) => {
    const frame = await openHost(page, version);
    expect(await hostCall(page, "connectLegacy")).toMatchObject({
      code: "SUCCESS",
    });
    const state = (await keychainCall(frame, "getState")) as any;
    const event = state.events.find((item: any) => item.name === "connect");
    expect(event.args.signupOptions).toEqual(["password"]);
    expect(state.events).toContainEqual(
      expect.objectContaining({
        name: "setRpcUrl",
        args: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9",
      }),
    );
  });
}

test("Torii precedence is carried by actual 0.13.13 and candidate SDKs", async ({
  page,
}) => {
  for (const version of ["0.13.13", "0.14.0-alpha.1"] as const) {
    const frame = await openHost(
      page,
      version,
      "?slot=legacy-game&torii=https%3A%2F%2Ftorii.example.com%2F%2F%2F",
    );
    const state = (await keychainCall(frame, "getState")) as any;
    expect(state.query.torii).toBe("https://torii.example.com///");
    expect(state.toriiUrl).toBe("https://torii.example.com");
  }
});

test("published 0.13.12 retains legacy Slot-derived Torii fallback", async ({
  page,
}) => {
  const frame = await openHost(page, "0.13.12", "?slot=legacy-game");
  const state = (await keychainCall(frame, "getState")) as any;
  expect(state.query.torii).toBeNull();
  expect(state.toriiUrl).toBe("https://api.cartridge.gg/x/legacy-game/torii");
});
