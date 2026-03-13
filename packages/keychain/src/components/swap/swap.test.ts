import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { getChecksumAddress, type Call } from "starknet";
import { useIsSwapTransaction, useSwapTransactions } from "./swap";

// Transactions mirrored from examples/next/src/components/Swap.tsx
const SWAP_SINGLE: Call[] = [
  {
    contractAddress:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    entrypoint: "transfer",
    calldata: [
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
      "0x32a03ab37fef8ba51",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "multihop_swap",
    calldata: [
      "0x2",
      "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "17014118346046924117642026945517453312",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x6f3528fe26840249f4b191ef6dff7928",
      "0xfffffc080ed7b455",
      0,
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "3402823669209384634633746074317682114",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x1000003f7f1380b75",
      "0x0",
      0,
      "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
      "0xa688906bd8b00000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear_minimum",
    calldata: [
      "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
      "0xa4de3d0e9ba40000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    ],
  },
];

const SWAP_MULTIPLE: Call[] = [
  {
    contractAddress:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    entrypoint: "transfer",
    calldata: [
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
      "0x176e9649d99dd740a",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "multihop_swap",
    calldata: [
      "0x2",
      "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
      "0x075afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87",
      "0",
      "0x56a4c",
      "0x005e470ff654d834983a46b8f29dfa99963d5044b993cb7b9c92243a69dab38f",
      "0x6f3528fe26840249f4b191ef6dff7928",
      "0xfffffc080ed7b455",
      0,
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x075afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87",
      "1020847100762815411640772995208708096",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x1000003f7f1380b75",
      "0x0",
      0,
      "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
      "0xde0b6b3a7640000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear_minimum",
    calldata: [
      "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
      "0xdbd2fc137a30000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    ],
  },
  {
    contractAddress:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    entrypoint: "transfer",
    calldata: [
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
      "0x4f1eba34861ddd0",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "multihop_swap",
    calldata: [
      "0x2",
      "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "17014118346046923173168730371588410572",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x6f3528fe26840249f4b191ef6dff7928",
      "0xfffffc080ed7b455",
      0,
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "17014118346046923173168730371588410572",
      "0x1744e",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0xf7c31547edfb13af0071dfd6ffe",
      "0x0",
      0,
      "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
      "0xde0b6b3a7640000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear_minimum",
    calldata: [
      "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
      "0xdbd2fc137a30000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    ],
  },
];

const LS2_PURCHASE_GAME: Call[] = [
  {
    contractAddress:
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    entrypoint: "transfer",
    calldata: [
      "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e",
      "0x5bbb37da193af4ba9",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e",
    entrypoint: "multihop_swap",
    calldata: [
      "0x1",
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x0452810188c4cb3aebd63711a3b445755bc0d6c4f27b923fdd99b1a118858136",
      "0",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x1000003f7f1380b75",
      "0x0",
      0,
      "0x0452810188C4Cb3AEbD63711a3b445755BC0D6C4f27B923fDd99B1A118858136",
      "0xde0b6b3a7640000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e",
    entrypoint: "clear_minimum",
    calldata: [
      "1955023220287003686908448593668771782622329060199208410425295899940041883958",
      "1000000000000000000",
      "0",
    ],
  },
  {
    contractAddress:
      "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    ],
  },
  {
    contractAddress:
      "0x0452810188C4Cb3AEbD63711a3b445755BC0D6C4f27B923fDd99B1A118858136",
    entrypoint: "approve",
    calldata: [
      "294172758298611957878874535440244936028848058202724233951972339591192112194",
      "1000000000000000000",
      "0",
    ],
  },
  {
    contractAddress:
      "0x00a67ef20b61a9846e1c82b411175e6ab167ea9f8632bd6c2091823c3629ec42",
    entrypoint: "buy_game",
    calldata: [
      "0",
      "0",
      "2017717448871504735845",
      "2403140985568399978641699320335980224292375691718886561247325844102368719999",
      "0",
    ],
  },
];

describe("useIsSwapTransaction", () => {
  it("returns false for empty transactions", () => {
    const { result } = renderHook(() => useIsSwapTransaction([]));
    expect(result.current.isSwap).toBe(false);
  });

  it("returns false for fewer than 4 transactions", () => {
    const { result } = renderHook(() =>
      useIsSwapTransaction([
        { contractAddress: "0x1", entrypoint: "transfer", calldata: [] },
        { contractAddress: "0x1", entrypoint: "multihop_swap", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear_minimum", calldata: [] },
      ]),
    );
    expect(result.current.isSwap).toBe(false);
  });

  it("returns false when transfer entrypoint is missing", () => {
    const { result } = renderHook(() =>
      useIsSwapTransaction([
        { contractAddress: "0x1", entrypoint: "approve", calldata: [] },
        { contractAddress: "0x1", entrypoint: "multihop_swap", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear_minimum", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear", calldata: [] },
      ]),
    );
    expect(result.current.isSwap).toBe(false);
  });

  it("returns false when multihop_swap entrypoint is missing", () => {
    const { result } = renderHook(() =>
      useIsSwapTransaction([
        { contractAddress: "0x1", entrypoint: "transfer", calldata: [] },
        { contractAddress: "0x1", entrypoint: "other", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear_minimum", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear", calldata: [] },
      ]),
    );
    expect(result.current.isSwap).toBe(false);
  });

  it("returns false when clear_minimum entrypoint is missing", () => {
    const { result } = renderHook(() =>
      useIsSwapTransaction([
        { contractAddress: "0x1", entrypoint: "transfer", calldata: [] },
        { contractAddress: "0x1", entrypoint: "multihop_swap", calldata: [] },
        { contractAddress: "0x1", entrypoint: "other", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear", calldata: [] },
      ]),
    );
    expect(result.current.isSwap).toBe(false);
  });

  it("returns false when clear entrypoint is missing", () => {
    const { result } = renderHook(() =>
      useIsSwapTransaction([
        { contractAddress: "0x1", entrypoint: "transfer", calldata: [] },
        { contractAddress: "0x1", entrypoint: "multihop_swap", calldata: [] },
        { contractAddress: "0x1", entrypoint: "clear_minimum", calldata: [] },
        { contractAddress: "0x1", entrypoint: "other", calldata: [] },
      ]),
    );
    expect(result.current.isSwap).toBe(false);
  });

  it("returns true for SWAP_SINGLE", () => {
    const { result } = renderHook(() => useIsSwapTransaction(SWAP_SINGLE));
    expect(result.current.isSwap).toBe(true);
  });

  it("returns true for SWAP_MULTIPLE", () => {
    const { result } = renderHook(() => useIsSwapTransaction(SWAP_MULTIPLE));
    expect(result.current.isSwap).toBe(true);
  });

  it("returns true for LS2_PURCHASE_GAME (swap + additional calls)", () => {
    const { result } = renderHook(() =>
      useIsSwapTransaction(LS2_PURCHASE_GAME),
    );
    expect(result.current.isSwap).toBe(true);
  });
});

describe("useSwapTransactions", () => {
  it("returns correct defaults for empty transactions", () => {
    const { result } = renderHook(() => useSwapTransactions([]));
    expect(result.current.isSwap).toBe(false);
    expect(result.current.swapMethodCount).toBe(0);
    expect(result.current.additionalMethodCount).toBe(0);
    expect(result.current.swapTransactions.selling).toHaveLength(0);
    expect(result.current.swapTransactions.buying).toHaveLength(0);
  });

  describe("SWAP_SINGLE", () => {
    it("is detected as a swap", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_SINGLE));
      expect(result.current.isSwap).toBe(true);
    });

    it("counts 4 swap methods and 0 additional calls", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_SINGLE));
      expect(result.current.swapMethodCount).toBe(4);
      expect(result.current.additionalMethodCount).toBe(0);
    });

    it("has one selling token (the transferred token)", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_SINGLE));
      expect(result.current.swapTransactions.selling).toHaveLength(1);
      expect(result.current.swapTransactions.selling[0].address).toBe(
        getChecksumAddress(
          "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
        ),
      );
    });

    it("has one buying token (from clear_minimum)", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_SINGLE));
      expect(result.current.swapTransactions.buying).toHaveLength(1);
      expect(result.current.swapTransactions.buying[0].address).toBe(
        getChecksumAddress(
          "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
        ),
      );
    });

    it("decodes selling amount from transfer calldata", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_SINGLE));
      // transfer calldata: [recipient, amount_low="0x32a03ab37fef8ba51", amount_high="0x0"]
      expect(result.current.swapTransactions.selling[0].amount).toBe(
        BigInt("0x32a03ab37fef8ba51"),
      );
    });

    it("decodes buying minimum from clear_minimum calldata", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_SINGLE));
      // clear_minimum calldata: [token, minimum_low="0xa4de3d0e9ba40000", minimum_high="0x0"]
      expect(result.current.swapTransactions.buying[0].amount).toBe(
        BigInt("0xa4de3d0e9ba40000"),
      );
    });
  });

  describe("SWAP_MULTIPLE", () => {
    it("is detected as a swap", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_MULTIPLE));
      expect(result.current.isSwap).toBe(true);
    });

    it("counts 8 swap methods and 0 additional calls", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_MULTIPLE));
      // 2 transfers + 2 multihop_swaps + 2 clear_minimums + 2 clears = 8
      expect(result.current.swapMethodCount).toBe(8);
      expect(result.current.additionalMethodCount).toBe(0);
    });

    it("aggregates selling amounts for the same token across both swaps", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_MULTIPLE));
      // Both transfers use the same contractAddress, so they're merged into one entry
      expect(result.current.swapTransactions.selling).toHaveLength(1);
      expect(result.current.swapTransactions.selling[0].address).toBe(
        getChecksumAddress(
          "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
        ),
      );
      expect(result.current.swapTransactions.selling[0].amount).toBe(
        BigInt("0x176e9649d99dd740a") + BigInt("0x4f1eba34861ddd0"),
      );
    });

    it("has two distinct buying tokens from the two clear_minimums", () => {
      const { result } = renderHook(() => useSwapTransactions(SWAP_MULTIPLE));
      expect(result.current.swapTransactions.buying).toHaveLength(2);
      expect(result.current.swapTransactions.buying[0].address).toBe(
        getChecksumAddress(
          "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
        ),
      );
      expect(result.current.swapTransactions.buying[1].address).toBe(
        getChecksumAddress(
          "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
        ),
      );
    });
  });

  describe("LS2_PURCHASE_GAME", () => {
    it("is detected as a swap", () => {
      const { result } = renderHook(() =>
        useSwapTransactions(LS2_PURCHASE_GAME),
      );
      expect(result.current.isSwap).toBe(true);
    });

    it("counts 4 swap methods and 2 additional calls (approve + buy_game)", () => {
      const { result } = renderHook(() =>
        useSwapTransactions(LS2_PURCHASE_GAME),
      );
      expect(result.current.swapMethodCount).toBe(4);
      expect(result.current.additionalMethodCount).toBe(2);
    });

    it("has one selling token", () => {
      const { result } = renderHook(() =>
        useSwapTransactions(LS2_PURCHASE_GAME),
      );
      expect(result.current.swapTransactions.selling).toHaveLength(1);
      expect(result.current.swapTransactions.selling[0].address).toBe(
        getChecksumAddress(
          "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
        ),
      );
    });

    it("has one buying token", () => {
      const { result } = renderHook(() =>
        useSwapTransactions(LS2_PURCHASE_GAME),
      );
      expect(result.current.swapTransactions.buying).toHaveLength(1);
    });
  });
});
