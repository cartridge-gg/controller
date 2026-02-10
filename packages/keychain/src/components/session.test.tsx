import {
  ConnectionContext,
  type ConnectionContextValue,
} from "@/components/provider/connection";
import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SemVer } from "semver";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Session } from "./session";

vi.mock("@/components/connect", () => ({
  CreateController: () => <div>Create Controller</div>,
  CreateSession: () => <div>Create Session</div>,
  RegisterSession: () => <div>Register Session</div>,
}));

function decodeBase64Json(encoded: string) {
  const padding = (4 - (encoded.length % 4)) % 4;
  const padded = `${encoded}${"=".repeat(padding)}`;
  return JSON.parse(atob(padded));
}

describe("Session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("includes session felt fields in already-registered callback payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const mockController = {
      username: vi.fn().mockReturnValue("alice"),
      address: vi.fn().mockReturnValue("0x123"),
      ownerGuid: vi.fn().mockReturnValue("0xowner"),
      isRegisteredSessionAuthorized: vi.fn().mockResolvedValue({
        allowedPoliciesRoot: "0x111",
        session: {
          expiresAt: 123n,
          metadataHash: "0x222",
          sessionKeyGuid: "0x333",
          guardianKeyGuid: "0x444",
        },
      }),
    };

    window.history.pushState(
      {},
      "",
      `/session?public_key=0xabc&callback_uri=${encodeURIComponent(
        "http://localhost/callback",
      )}`,
    );

    const connection: ConnectionContextValue = {
      parent: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      controller: mockController as any,
      origin: "https://test.app",
      rpcUrl: "https://rpc.test.app",
      project: null,
      namespace: null,
      propagateError: false,
      tokens: [],
      policies: {
        verified: true,
        contracts: {},
        messages: [],
      },
      theme: {
        verified: true,
        name: "TestApp",
        icon: "https://test.app/icon.png",
        cover: "https://test.app/cover.png",
      },
      isConfigLoading: false,
      isMainnet: false,
      verified: true,
      chainId: "SN_MAIN",
      setController: vi.fn(),
      controllerVersion: new SemVer("1.0.0"),
      setRpcUrl: vi.fn(),
      openModal: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      openSettings: vi.fn(),
      externalDetectWallets: vi.fn().mockResolvedValue([]),
      externalConnectWallet: vi.fn().mockResolvedValue({} as never),
      externalSignTypedData: vi.fn().mockResolvedValue({} as never),
      externalSignMessage: vi.fn().mockResolvedValue({} as never),
      externalSendTransaction: vi.fn().mockResolvedValue({} as never),
      externalGetBalance: vi.fn().mockResolvedValue({} as never),
      externalWaitForTransaction: vi.fn().mockResolvedValue({} as never),
    };

    render(
      <BrowserRouter>
        <ConnectionContext.Provider value={connection}>
          <Session />
        </ConnectionContext.Provider>
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestOptions] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const payload = decodeBase64Json(requestOptions.body as string);

    expect(payload.alreadyRegistered).toBe(true);
    expect(payload.allowedPoliciesRoot).toBe("0x111");
    expect(payload.metadataHash).toBe("0x222");
    expect(payload.sessionKeyGuid).toBe("0x333");
    expect(payload.guardianKeyGuid).toBe("0x444");
  });
});
