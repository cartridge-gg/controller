import { FeatureProvider } from "@/hooks/features";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach } from "vitest";
import { AdvancedViewSection } from "./advanced-view-section";

const LOCAL_STORAGE_KEY = "@cartridge/features";

function renderSection() {
  return render(
    <FeatureProvider>
      <AdvancedViewSection />
    </FeatureProvider>,
  );
}

describe("AdvancedViewSection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders an accessible switch that is unchecked by default", () => {
    renderSection();

    expect(
      screen.getByRole("switch", { name: "Advanced view" }),
    ).not.toBeChecked();
    expect(
      screen.getByText(
        "Show network details, addresses, transaction data, and explorer links.",
      ),
    ).toBeVisible();
  });

  it("reflects the persisted advanced view preference", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ "advanced-view": true }),
    );

    renderSection();

    expect(screen.getByRole("switch", { name: "Advanced view" })).toBeChecked();
  });

  it("enables and disables advanced view immediately", async () => {
    renderSection();
    const advancedViewSwitch = screen.getByRole("switch", {
      name: "Advanced view",
    });

    fireEvent.click(advancedViewSwitch);
    expect(advancedViewSwitch).toBeChecked();
    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"),
      ).toEqual({ "advanced-view": true });
    });

    fireEvent.click(advancedViewSwitch);
    expect(advancedViewSwitch).not.toBeChecked();
    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"),
      ).toEqual({ "advanced-view": false });
    });
  });
});
