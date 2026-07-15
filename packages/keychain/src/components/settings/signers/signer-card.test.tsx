import { UIProvider } from "@cartridge/controller-ui";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { SignerCard } from "./signer-card";

vi.mock("@/hooks/controller", () => ({
  useController: () => ({ controller: undefined }),
}));

describe("SignerCard", () => {
  it("keeps Starknet signer details specific in simple view", async () => {
    render(
      <UIProvider value={{ advancedView: false }}>
        <SignerCard
          signer={
            {
              __typename: "StarknetCredentials",
              starknet: [
                {
                  __typename: "StarknetCredential",
                  publicKey: "0x123",
                },
              ],
            } as never
          }
          isOriginalSigner
        />
      </UIProvider>,
    );

    expect(screen.getByText(/Argent/)).toBeVisible();
    expect(screen.queryByText(/External wallet/)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Starknet")).toBeVisible());
  });
});
