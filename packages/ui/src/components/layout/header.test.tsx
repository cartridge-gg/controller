import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../context";
import { LayoutHeader } from "./header";

vi.mock("@/components/network", () => ({
  Network: () => <span>network-details</span>,
}));

vi.mock("@/index", () => ({
  ConnectionTooltip: () => null,
  Thumbnail: ({ icon }: { icon?: unknown }) => (
    <span>{String(icon ?? "")}</span>
  ),
}));

vi.mock("./starry-header", () => ({
  StarryHeaderBackground: () => <div />,
}));

describe("LayoutHeader network disclosure", () => {
  it("hides the unauthenticated network badge in simple mode", () => {
    const markup = renderToStaticMarkup(
      <UIProvider value={{ advancedView: false, chainId: "0x1" }}>
        <LayoutHeader title="Connect" />
      </UIProvider>,
    );

    expect(markup).not.toContain("network-details");
  });

  it("preserves the unauthenticated network badge in advanced mode", () => {
    const markup = renderToStaticMarkup(
      <UIProvider value={{ advancedView: true, chainId: "0x1" }}>
        <LayoutHeader title="Connect" />
      </UIProvider>,
    );

    expect(markup).toContain("network-details");
  });
});
