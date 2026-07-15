import { UIProvider } from "../../context";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdvancedDetails, AdvancedLink } from "./advanced-disclosure";

describe("advanced disclosure primitives", () => {
  it("preserves advanced presentation for legacy consumers", () => {
    const markup = renderToStaticMarkup(
      <UIProvider value={{}}>
        <AdvancedDetails>Network details</AdvancedDetails>
        <AdvancedLink href="https://explorer.example/tx/1">
          View transaction
        </AdvancedLink>
      </UIProvider>,
    );

    expect(markup).toContain("Network details");
    expect(markup).toContain('href="https://explorer.example/tx/1"');
  });

  it("renders non-interactive fallbacks in simple mode", () => {
    const markup = renderToStaticMarkup(
      <UIProvider value={{ advancedView: false }}>
        <AdvancedDetails fallback="Summary">Network details</AdvancedDetails>
        <AdvancedLink
          fallback="Transaction complete"
          href="https://explorer.example/tx/1"
        >
          View transaction
        </AdvancedLink>
      </UIProvider>,
    );

    expect(markup).toBe("SummaryTransaction complete");
    expect(markup).not.toContain("<a");
  });

  it.each([undefined, null, "", "   ", "#", " # "])(
    "does not render an anchor for invalid href %s",
    (href) => {
      const markup = renderToStaticMarkup(
        <UIProvider value={{ advancedView: true }}>
          <AdvancedLink href={href}>View transaction</AdvancedLink>
        </UIProvider>,
      );

      expect(markup).toBe("View transaction");
      expect(markup).not.toContain("<a");
    },
  );
});
