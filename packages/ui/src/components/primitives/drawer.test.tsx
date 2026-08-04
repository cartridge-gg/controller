import type { HTMLAttributes, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DrawerContent } from "./drawer";

vi.mock("@/index", () => ({
  SheetTitle: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  Thumbnail: ({ icon }: { icon: ReactNode }) => (
    <div data-testid="thumbnail">{icon}</div>
  ),
}));

describe("DrawerContent", () => {
  it("renders a title without an icon thumbnail", () => {
    const markup = renderToStaticMarkup(
      <DrawerContent title="Deposit USD">
        <div>Content</div>
      </DrawerContent>,
    );

    expect(markup).toContain("Deposit USD");
    expect(markup).toContain("Content");
    expect(markup).not.toContain('data-testid="thumbnail"');
    expect(markup).not.toContain("<svg");
  });
});
