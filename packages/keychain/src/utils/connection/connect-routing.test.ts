import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ResponseCodes } from "@cartridge/controller";
import type { AuthOptions, ConnectOptions } from "@cartridge/controller";
import { createConnectHandler } from "./connect-routing";

describe("connect routing", () => {
  const navigate = vi.fn();
  const uiConnect = vi.fn();
  const headlessConnect = vi.fn();
  const waitForApproval = vi.fn();

  const open = vi.fn();
  const onSessionCreated = vi.fn();
  const getParent = () => ({ open, onSessionCreated });

  const getConnectedAddress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Silence intentional error logs from safeCall.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates to uiConnect for non-headless options", async () => {
    uiConnect.mockResolvedValue({
      code: ResponseCodes.SUCCESS,
      address: "0x1",
    });

    const handler = createConnectHandler({
      uiConnect,
      headlessConnect,
      navigate,
      getParent,
      waitForApproval,
      getConnectedAddress,
    });

    const result = await handler(["webauthn"] as unknown as AuthOptions);
    expect(result).toEqual({ code: ResponseCodes.SUCCESS, address: "0x1" });
    expect(uiConnect).toHaveBeenCalledTimes(1);
    expect(headlessConnect).not.toHaveBeenCalled();
  });

  it("awaits onSessionCreated for headless immediate success", async () => {
    headlessConnect.mockResolvedValue({
      code: ResponseCodes.SUCCESS,
      address: "0xabc",
    });

    const handler = createConnectHandler({
      uiConnect,
      headlessConnect,
      navigate,
      getParent,
      waitForApproval,
      getConnectedAddress,
    });

    const result = await handler({
      username: "alice",
      signer: "webauthn",
    } as unknown as ConnectOptions);

    expect(result).toEqual({ code: ResponseCodes.SUCCESS, address: "0xabc" });
    expect(onSessionCreated).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(waitForApproval).not.toHaveBeenCalled();
  });

  it("opens approval route and resolves only after approval", async () => {
    headlessConnect.mockResolvedValue({
      code: ResponseCodes.USER_INTERACTION_REQUIRED,
      requestId: "req-1",
    });
    waitForApproval.mockResolvedValue(undefined);
    getConnectedAddress.mockReturnValue("0xdead");

    const handler = createConnectHandler({
      uiConnect,
      headlessConnect,
      navigate,
      getParent,
      waitForApproval,
      getConnectedAddress,
    });

    const result = await handler({
      username: "alice",
      signer: "webauthn",
    } as unknown as ConnectOptions);

    expect(navigate).toHaveBeenCalledWith("/headless-approval/req-1", {
      replace: true,
    });
    expect(open).toHaveBeenCalledTimes(1);
    expect(waitForApproval).toHaveBeenCalledWith("req-1");
    expect(onSessionCreated).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ code: ResponseCodes.SUCCESS, address: "0xdead" });
  });

  it("does not fail connect when onSessionCreated throws", async () => {
    headlessConnect.mockResolvedValue({
      code: ResponseCodes.SUCCESS,
      address: "0xabc",
    });
    onSessionCreated.mockRejectedValueOnce(new Error("boom"));

    const handler = createConnectHandler({
      uiConnect,
      headlessConnect,
      navigate,
      getParent,
      waitForApproval,
      getConnectedAddress,
    });

    const result = await handler({
      username: "alice",
      signer: "webauthn",
    } as unknown as ConnectOptions);

    expect(result).toEqual({ code: ResponseCodes.SUCCESS, address: "0xabc" });
  });
});
