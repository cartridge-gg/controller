import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeatureProvider } from "@/hooks/features";
import { ControllerErrorAlert } from "./ErrorAlert";
import { ExternalWalletError } from "@/utils/errors";

vi.mock("@cartridge/controller", () => ({
  humanizeString: (value: string) => value,
}));

const rawDiagnostic =
  "rpc error: code = Internal desc = secret contract 0xdeadbeef";

describe("ControllerErrorAlert disclosure", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses a safe fallback without leaking raw diagnostics by default", () => {
    render(
      <FeatureProvider>
        <ControllerErrorAlert error={new Error(rawDiagnostic)} />
      </FeatureProvider>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/Please try again/)).toBeInTheDocument();
    expect(screen.queryByText(/0xdeadbeef/)).not.toBeInTheDocument();
  });

  it("restores the existing diagnostic presentation in advanced view", () => {
    localStorage.setItem(
      "@cartridge/features",
      JSON.stringify({ "advanced-view": true }),
    );

    render(
      <FeatureProvider>
        <ControllerErrorAlert error={new Error(rawDiagnostic)} />
      </FeatureProvider>,
    );

    expect(screen.getByText("secret contract 0xdeadbeef")).toBeInTheDocument();
  });

  it("only promises nothing changed for explicit wallet rejection", () => {
    render(
      <FeatureProvider>
        <ControllerErrorAlert
          error={new ExternalWalletError("USER_REFUSED_OP")}
        />
      </FeatureProvider>,
    );

    expect(screen.getByText("Request cancelled")).toBeInTheDocument();
    expect(screen.getByText("Nothing was changed.")).toBeInTheDocument();
  });

  it("uses a neutral warning for ambiguous wallet failures", () => {
    render(
      <FeatureProvider>
        <ControllerErrorAlert
          error={
            new ExternalWalletError("No transaction hash returned from wallet")
          }
        />
      </FeatureProvider>,
    );

    expect(screen.getByText("Wallet request failed")).toBeInTheDocument();
    expect(screen.getByText(/recent activity/)).toBeInTheDocument();
    expect(screen.queryByText("Nothing was changed.")).not.toBeInTheDocument();
  });
});
