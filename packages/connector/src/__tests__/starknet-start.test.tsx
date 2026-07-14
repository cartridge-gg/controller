// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { mainnet, sepolia } from "@starknet-start/chains";
import { jsonRpcProvider } from "@starknet-start/providers";
import {
  StarknetConfig,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchChain,
  type UseConnectResult,
} from "@starknet-start/react";
import React, { type PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ControllerConnector from "../controller";
import SessionConnector from "../session";

const ADDRESS = `0x${"1".padStart(64, "0")}`;
type Wallet = UseConnectResult["connectors"][number];

const provider = jsonRpcProvider({
  rpc: (chain) => ({ nodeUrl: `https://rpc.example/${chain.network}` }),
});

function wrapper({ children }: PropsWithChildren) {
  return (
    <StarknetConfig chains={[mainnet, sepolia]} provider={provider}>
      {children}
    </StarknetConfig>
  );
}

describe("Starknet Start integration", () => {
  afterEach(() => {
    delete (window as any).starknet_controller;
    delete (window as any).starknet_controller_session;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("discovers the real Controller wallet wrapper and uses iframe RPC at its boundary", async () => {
    const registrations: Wallet[] = [];
    window.addEventListener(
      "wallet-standard:register-wallet",
      ((event: CustomEvent) => {
        event.detail({
          register: (...wallets: Wallet[]) => registrations.push(...wallets),
        });
      }) as EventListener,
      { once: true },
    );

    const connector = new ControllerConnector({ lazyload: true });
    const keychain = {
      probe: vi.fn(async (rpcUrl: string) => ({ address: ADDRESS, rpcUrl })),
      switchChain: vi.fn(async () => undefined),
      reset: vi.fn(),
    };
    Object.assign(connector.controller as any, {
      keychain,
      iframes: {
        keychain: {
          open: vi.fn(),
          close: vi.fn(),
        },
      },
    });

    expect(registrations).toHaveLength(1);
    const registeredWallet = registrations[0];
    expect(registeredWallet.name).toBe("Controller");

    const { result } = renderHook(
      () => ({
        account: useAccount(),
        connect: useConnect(),
        disconnect: useDisconnect(),
        network: useNetwork(),
        switchChain: useSwitchChain({}),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.connect.connectors).toContain(registeredWallet),
    );
    expect(
      ControllerConnector.fromConnectors(result.current.connect.connectors),
    ).toBe(connector);

    await act(() =>
      result.current.connect.connectAsync({ connector: registeredWallet }),
    );
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));
    expect(result.current.account.address).toBe(ADDRESS);
    expect(result.current.network.chain.id).toBe(mainnet.id);
    expect(keychain.probe).toHaveBeenCalledWith(
      "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9",
    );

    await act(() =>
      result.current.switchChain.switchChainAsync({
        chainId: "0x534e5f5345504f4c4941",
      }),
    );
    await waitFor(() =>
      expect(result.current.network.chain.id).toBe(sepolia.id),
    );
    expect(keychain.switchChain).toHaveBeenCalledWith(
      "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
    );
    await expect(
      connector.controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe("0x534e5f5345504f4c4941");

    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      await act(() => result.current.disconnect.disconnectAsync());
      await waitFor(() =>
        expect(result.current.account.isDisconnected).toBe(true),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        "accountsChanged listener failed",
        expect.any(TypeError),
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("discovers, connects, and disconnects the real Session wallet wrapper without advertising chain switching", async () => {
    const registrations: Wallet[] = [];
    window.addEventListener(
      "wallet-standard:register-wallet",
      ((event: CustomEvent) => {
        event.detail({
          register: (...wallets: Wallet[]) => registrations.push(...wallets),
        });
      }) as EventListener,
      { once: true },
    );
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    const connector = new SessionConnector({
      rpc: "https://rpc.example/mainnet",
      chainId: "0x534e5f4d41494e",
      policies: {},
      redirectUrl: "https://game.example/session",
      keychainUrl: "https://keychain.example",
    });
    Object.assign(connector.controller as any, {
      account: {
        address: ADDRESS,
        provider: {
          getChainId: vi.fn(async () => "0x534e5f4d41494e"),
        },
      },
    });

    expect(registrations).toHaveLength(1);
    const registeredWallet = registrations[0];
    expect(registeredWallet.name).toBe("Controller Session");
    expect(registeredWallet.chains).toEqual(["starknet:0x534e5f4d41494e"]);

    const { result } = renderHook(
      () => ({
        account: useAccount(),
        connect: useConnect(),
        disconnect: useDisconnect(),
        network: useNetwork(),
        switchChain: useSwitchChain({}),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.connect.connectors).toContain(registeredWallet),
    );
    expect(
      SessionConnector.fromConnectors(result.current.connect.connectors),
    ).toBe(connector);

    await act(() =>
      result.current.connect.connectAsync({ connector: registeredWallet }),
    );
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));
    expect(result.current.account.address).toBe(ADDRESS);
    expect(result.current.network.chain.id).toBe(mainnet.id);

    await expect(
      result.current.switchChain.switchChainAsync({
        chainId: "0x534e5f5345504f4c4941",
      }),
    ).rejects.toThrow("switchStarknetChain not implemented");
    expect(result.current.network.chain.id).toBe(mainnet.id);

    await act(() => result.current.disconnect.disconnectAsync());
    await waitFor(() =>
      expect(result.current.account.isDisconnected).toBe(true),
    );
    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "https://keychain.example/disconnect",
      }),
      "_blank",
    );
  });
});
