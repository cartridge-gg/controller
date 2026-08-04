import { render, screen } from "@testing-library/react";
import { UIProvider } from "@cartridge/controller-ui";
import { constants } from "starknet";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContractLink } from "./ContractLink";

const chainId = vi.fn();

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({ controller: { chainId } }),
}));

vi.mock("@starknet-react/core", () => ({
  useExplorer: () => ({
    contract: (address: string) => `https://explorer.test/contract/${address}`,
  }),
}));

describe("ContractLink", () => {
  beforeEach(() => {
    chainId.mockReturnValue(constants.StarknetChainId.SN_MAIN);
  });

  it("removes the address and link from simple view", () => {
    render(
      <UIProvider value={{ advancedView: false }}>
        <ContractLink contractAddress="0x123456789" />
      </UIProvider>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/0x123/)).not.toBeInTheDocument();
  });

  it("links supported-chain addresses in advanced view", () => {
    render(
      <UIProvider value={{ advancedView: true }}>
        <ContractLink contractAddress="0x123456789" />
      </UIProvider>,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://explorer.test/contract/0x123456789",
    );
  });

  it("renders no pseudo-link for unsupported chains", () => {
    chainId.mockReturnValue("0x123");

    render(
      <UIProvider value={{ advancedView: true }}>
        <ContractLink contractAddress="0x123456789" />
      </UIProvider>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(document.querySelector('[href="#"]')).not.toBeInTheDocument();
  });
});
