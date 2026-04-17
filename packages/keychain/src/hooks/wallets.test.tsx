import { render } from "@testing-library/react";
import { WalletAdapter } from "@cartridge/controller";
import { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalletsProvider } from "./wallets";

const mockParent = {
  externalDetectWallets: vi.fn().mockResolvedValue([]),
  externalConnectWallet: vi.fn(),
  externalSignMessage: vi.fn(),
  externalSignTypedData: vi.fn(),
  externalSendTransaction: vi.fn(),
  externalGetBalance: vi.fn(),
  externalSwitchChain: vi.fn(),
  externalWaitForTransaction: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  reload: vi.fn(),
};

vi.mock("./connection", () => ({
  useConnection: () => ({ parent: mockParent }),
}));

const Wrapper = ({ children }: PropsWithChildren) => (
  <WalletsProvider>{children}</WalletsProvider>
);

const makeWallet = (address: string): WalletAdapter =>
  ({
    type: "turnkey",
    platform: "ethereum",
    signMessage: vi.fn().mockResolvedValue({
      success: true,
      wallet: "turnkey",
      result: `0xsig-for-${address}`,
    }),
    getConnectedAccounts: () => [address],
    getInfo: () => ({
      type: "turnkey",
      platform: "ethereum",
      available: true,
      name: "Turnkey",
      connectedAccounts: [address],
    }),
  }) as unknown as WalletAdapter;

// Lowercase so ethers getAddress() normalizes rather than validating checksum.
const ADDRESS = "0x708aec02b92f5895b74484f7c771beaf3a0dabe7";

describe("WalletsProvider embedded wallet persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    delete (window as { keychain_wallets?: unknown }).keychain_wallets;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as { keychain_wallets?: unknown }).keychain_wallets;
  });

  it("initializes window.keychain_wallets when mounted", () => {
    render(
      <Wrapper>
        <div />
      </Wrapper>,
    );

    expect(window.keychain_wallets).toBeDefined();
  });

  it("preserves embedded wallets registered before unmount", async () => {
    // This is the OAuth-redirect bug: the handler registers a social
    // embedded wallet, then setSearchParams triggers a provider remount,
    // then session registration needs to sign with that wallet. The map
    // must survive the remount; otherwise signMessage falls through to
    // the external bridge and fails with "No wallet found with connected
    // address".
    const { unmount } = render(
      <Wrapper>
        <div />
      </Wrapper>,
    );

    const wallet = makeWallet(ADDRESS);
    window.keychain_wallets!.addEmbeddedWallet(ADDRESS, wallet);
    expect(window.keychain_wallets!.getEmbeddedWallet(ADDRESS)).toBe(wallet);

    unmount();

    // Wallet must still be resolvable after unmount so that a subsequent
    // remount can use it without re-registration.
    expect(window.keychain_wallets).toBeDefined();
    expect(window.keychain_wallets!.getEmbeddedWallet(ADDRESS)).toBe(wallet);

    render(
      <Wrapper>
        <div />
      </Wrapper>,
    );

    const resolved = window.keychain_wallets!.getEmbeddedWallet(ADDRESS);
    expect(resolved).toBe(wallet);

    const response = await window.keychain_wallets!.signMessage(
      ADDRESS,
      "0xdeadbeef",
    );
    expect(response.success).toBe(true);
    expect(wallet.signMessage).toHaveBeenCalledWith("0xdeadbeef");
    expect(mockParent.externalSignMessage).not.toHaveBeenCalled();
  });
});
