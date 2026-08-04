import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AmountSelection } from "./AmountSelection";

describe("AmountSelection", () => {
  it("selects the smallest configured amount that covers the minimum", async () => {
    const onChange = vi.fn();

    render(<AmountSelection minAmount={15} onChange={onChange} />);

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(20));
    expect(screen.getByRole("button", { name: "$10" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "$20" })).toBeEnabled();
  });

  it("uses the required custom amount when no configured amount is large enough", async () => {
    const onChange = vi.fn();

    render(<AmountSelection minAmount={70} onChange={onChange} />);

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(70));
    expect(screen.getByRole("spinbutton")).toHaveValue(70);
  });
});
