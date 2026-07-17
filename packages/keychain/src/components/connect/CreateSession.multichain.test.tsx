import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateSession } from "./CreateSession";
import { renderWithProviders } from "@/test/mocks/providers";
import type { ParsedSessionPolicies } from "@/hooks/session";
import type { SessionChainPolicies } from "@/hooks/connection";
import type Controller from "@/utils/controller";

const SEPOLIA = "0x534e5f5345504f4c4941";
const APPCHAIN = "0x4341525452494447455f544553544e4554";

const makePolicies = (
  verified: boolean,
  contract: string,
): ParsedSessionPolicies => ({
  verified,
  contracts: {
    [contract]: {
      methods: [
        { name: "Pull", entrypoint: "pull", authorized: true, id: "pull" },
      ],
    },
  },
});

const makeChainPolicies = (verified: boolean): SessionChainPolicies => [
  {
    chainId: SEPOLIA,
    rpcUrl: "https://sepolia.example/rpc",
    policies: makePolicies(verified, "0xaaa"),
  },
  {
    chainId: APPCHAIN,
    rpcUrl: "https://appchain.example/rpc",
    policies: makePolicies(verified, "0xbbb"),
  },
];

describe("CreateSession multichain", () => {
  const makeController = (
    results: Array<{ chainId: string; error?: Error }>,
  ) => {
    const createMultichainSession = vi.fn().mockResolvedValue(results);
    const controller = {
      createSession: vi.fn().mockResolvedValue({}),
      createMultichainSession,
    } as unknown as Controller;
    return { controller, createMultichainSession };
  };

  const renderMultichain = (
    controller: Controller,
    chainPolicies: SessionChainPolicies,
  ) =>
    renderWithProviders(
      <CreateSession
        policies={chainPolicies[0].policies}
        chainPolicies={chainPolicies}
        onConnect={onConnect}
      />,
      {
        connection: {
          controller,
          origin: "https://game.example",
        },
      },
    );

  let onConnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onConnect = vi.fn();
  });

  it("renders one policy section per chain", () => {
    const { controller } = makeController([]);
    renderMultichain(controller, makeChainPolicies(false));

    // Chain headers resolved via getChainName: Sepolia + decoded appchain name.
    expect(screen.getByText("Sepolia")).toBeInTheDocument();
    expect(screen.getByText("CARTRIDGE_TESTNET")).toBeInTheDocument();
  });

  it("requires consent for unverified chains before signing", async () => {
    const { controller, createMultichainSession } = makeController([
      { chainId: SEPOLIA },
      { chainId: APPCHAIN },
    ]);
    renderMultichain(controller, makeChainPolicies(false));

    const continueButton = screen.getByRole("button", { name: /continue/i });
    // The continue button stays disabled until the consent box is checked.
    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByText(/are not verified/i));
    expect(createMultichainSession).not.toHaveBeenCalled();

    fireEvent.click(continueButton);
    await waitFor(() =>
      expect(createMultichainSession).toHaveBeenCalledTimes(1),
    );

    const [origin, , inputs] = createMultichainSession.mock.calls[0];
    expect(origin).toBe("https://game.example");
    expect(inputs).toHaveLength(2);
    expect(inputs.map((i: { chainId: string }) => i.chainId)).toEqual([
      SEPOLIA,
      APPCHAIN,
    ]);
    // UI-only fields are stripped and policies forced authorized.
    expect(inputs[0].policies.contracts["0xaaa"].methods[0].id).toBeUndefined();
    expect(inputs[0].policies.contracts["0xaaa"].methods[0].authorized).toBe(
      true,
    );
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1));
  });

  it("offers to retry only the chains that failed", async () => {
    const { controller, createMultichainSession } = makeController([
      { chainId: SEPOLIA },
      { chainId: APPCHAIN, error: new Error("user cancelled") },
    ]);
    renderMultichain(controller, makeChainPolicies(false));

    fireEvent.click(screen.getByText(/are not verified/i)); // consent
    fireEvent.click(screen.getByRole("button", { name: /continue/i })); // sign

    // Partial failure: connect is NOT resolved, retry button appears.
    const retryButton = await screen.findByRole("button", {
      name: /retry remaining chains/i,
    });
    expect(onConnect).not.toHaveBeenCalled();

    // Retrying only re-signs the failed chain.
    createMultichainSession.mockResolvedValueOnce([{ chainId: APPCHAIN }]);
    fireEvent.click(retryButton);
    await waitFor(() =>
      expect(createMultichainSession).toHaveBeenCalledTimes(2),
    );
    const retryInputs = createMultichainSession.mock.calls[1][2];
    expect(retryInputs).toHaveLength(1);
    expect(retryInputs[0].chainId).toBe(APPCHAIN);
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1));
  });

  it("signs directly without consent when every chain is verified", async () => {
    const { controller, createMultichainSession } = makeController([
      { chainId: SEPOLIA },
      { chainId: APPCHAIN },
    ]);
    renderMultichain(controller, makeChainPolicies(true));

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() =>
      expect(createMultichainSession).toHaveBeenCalledTimes(1),
    );
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1));
  });

  it("keeps the single-chain path when no chainPolicies are provided", async () => {
    const { controller, createMultichainSession } = makeController([]);
    renderWithProviders(
      <CreateSession
        policies={makePolicies(true, "0xaaa")}
        onConnect={onConnect}
      />,
      { connection: { controller, origin: "https://game.example" } },
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() =>
      expect(controller.createSession).toHaveBeenCalledTimes(1),
    );
    expect(createMultichainSession).not.toHaveBeenCalled();
  });
});
