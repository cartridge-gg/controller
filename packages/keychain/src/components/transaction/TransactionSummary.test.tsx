import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeatureProvider } from "@/hooks/features";
import { TransactionSummary } from "./TransactionSummary";

vi.mock("@cartridge/controller", () => ({
  humanizeString: (value: string) => value,
}));

vi.mock("@/components/simulation/SimulationResults", () => ({
  SimulationResults: () => <div>Amount: 10 TOKEN</div>,
}));

describe("TransactionSummary simple view safety", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the simulated amount and transfer recipient visible", () => {
    const recipient = "0x456";

    render(
      <FeatureProvider>
        <TransactionSummary
          calls={[
            {
              contractAddress: `0x${"2".repeat(64)}`,
              entrypoint: "transfer",
              calldata: [recipient, "0xa", "0x0"],
            },
          ]}
          isExpanded
          simulate
        />
      </FeatureProvider>,
    );

    expect(screen.getByText("Amount: 10 TOKEN")).toBeInTheDocument();
    expect(screen.getByText("Recipient")).toBeInTheDocument();
    expect(screen.getByText(/0x000000/)).toBeInTheDocument();
    expect(screen.queryByText("Calldata")).not.toBeInTheDocument();
  });
});
