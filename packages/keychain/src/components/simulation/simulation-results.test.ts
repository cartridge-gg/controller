import { describe, it, expect, beforeEach } from "vitest";
import { type RpcProvider } from "starknet";
import {
  consolidateSimulationEvents,
  parseSimulationEvents,
  type SimulationBalance,
} from "./event-parser";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  CALLER,
  ERC1155_ADDRESS,
  ERC20_ADDRESS,
  ERC721_ADDRESS,
  STRK_ADDRESS,
} from "./test_data/katana_transactions";

// data exported from katanta tests from:
// https://github.com/rsodre/starknet_simulation

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "test_data");

const bigintReviver = (_key: string, value: unknown): unknown => {
  if (typeof value === "string" && value.startsWith("__bigint__:")) {
    return BigInt(value.slice("__bigint__:".length));
  }
  return value;
};

const IERC721_ID = BigInt(
  "0x33eb2f84c309543403fd69f0d0f363781ef06ef6faeb0131ff16ea3175bd943",
);
const IERC1155_ID = BigInt(
  "0x6114a8f75559e1b39fcba08ce02961a1aa082d9256a158dd3e64964e4b1b52",
);

const ONE_ETH = 1_000_000_000_000_000_000n;

const mockProvider = {
  callContract: async (call: {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
  }) => {
    const addr = BigInt(call.contractAddress);
    if (addr === BigInt(ERC20_ADDRESS) && call.entrypoint === "decimals")
      return ["0x12"];
    if (
      addr === BigInt(ERC721_ADDRESS) &&
      call.entrypoint === "supports_interface" &&
      BigInt(call.calldata[0] ?? 0) === IERC721_ID
    )
      return ["0x1"];
    if (
      addr === BigInt(ERC1155_ADDRESS) &&
      call.entrypoint === "supports_interface" &&
      BigInt(call.calldata[0] ?? 0) === IERC1155_ID
    )
      return ["0x1"];
    return ["0x0"];
  },
} as unknown as RpcProvider;

let currentTestName = "";
beforeEach(({ task }) => {
  currentTestName = task.name;
});

const simulate = async () => {
  const raw = await readFile(
    join(DATA_DIR, `${currentTestName}.json`),
    "utf-8",
  );
  const responses = JSON.parse(raw, bigintReviver);
  const events = await parseSimulationEvents(
    responses,
    mockProvider,
    BigInt(CALLER),
  );
  const result = consolidateSimulationEvents(events, BigInt(CALLER));
  return result;
};

const getBalanceDiff = (
  result: SimulationBalance[],
  contractAddress: string,
): bigint | undefined => {
  const c = result.find(
    (r) => BigInt(r.contractAddress) === BigInt(contractAddress),
  );
  if (!c) return undefined;
  return c.balance;
};

const getAllowances = (
  result: SimulationBalance[],
  contractAddress: string,
): bigint | undefined => {
  const c = result.find(
    (r) => BigInt(r.contractAddress) === BigInt(contractAddress),
  );
  if (!c) return undefined;
  return c.allowance + (c.approvedAll ? 100n : 0n);
};

describe("simulate erc20", () => {
  it("erc20_single_transfer", async () => {
    const result = await simulate();
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(erc20Diff).toBe(-ONE_ETH);
  });

  it("erc20_multi_transfer", async () => {
    const result = await simulate();
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    // 1 ETH + 10 ETH + 9 ETH = 20 ETH total sent
    expect(erc20Diff).toBe(-20n * ONE_ETH);
    expect(strkDiff).toBe(-3n * ONE_ETH);
  });

  it("erc20_single_approval", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC20_ADDRESS);
    expect(allowance).toBe(ONE_ETH);
  });

  it("erc20_multi_approval", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC20_ADDRESS);
    const strkAllowance = getAllowances(result, STRK_ADDRESS);
    // RECIPIENT1: 1 ETH overwritten by 10 ETH, RECIPIENT2: 9 ETH → total = 19 ETH
    expect(allowance).toBe(19n * ONE_ETH);
    expect(strkAllowance).toBe(3n * ONE_ETH);
  });

  it("erc20_swap_transferred", async () => {
    const result = await simulate();
    // caller sends 1 ETH STRK to router, receives 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
  });

  it("erc20_swap_transferred_over", async () => {
    const result = await simulate();
    // caller sends 3 ETH STRK to router but swaps only 1 ETH, receives 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(strkDiff).toBe(-5n * ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
  });

  it("erc20_swap_approved", async () => {
    const result = await simulate();
    // caller approves 1 ETH STRK, router pulls it and sends 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(0n);
  });

  it("erc20_swap_approved_over", async () => {
    const result = await simulate();
    // caller approves 3 ETH STRK but router only pulls 1 ETH, sends 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(3n * ONE_ETH);
  });

  it("erc20_swap_approved_extra_before", async () => {
    const result = await simulate();
    // approve RECIPIENT1 3 ETH, then approve+swap ROUTER 1 ETH → ROUTER allowance consumed, RECIPIENT1 remains
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(3n * ONE_ETH);
  });

  it("erc20_swap_approved_extra_after", async () => {
    const result = await simulate();
    // approve+swap ROUTER 1 ETH, then approve RECIPIENT1 3 ETH → ROUTER allowance consumed, RECIPIENT1 remains
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(3n * ONE_ETH);
  });
});

describe("simulate erc721", () => {
  it("erc721_single_transfer", async () => {
    const result = await simulate();
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(erc721Diff).toBe(-1n);
  });

  it("erc721_multi_transfer", async () => {
    const result = await simulate();
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(erc721Diff).toBe(-3n);
  });

  it("erc721_single_approval", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    expect(allowance).toBe(1n);
  });

  it("erc721_multi_approval", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // 3 distinct tokenIds approved → allowance count = 3
    expect(allowance).toBe(3n);
  });

  it("erc721_approve_all", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // operator approved → approvedAll adds 100 tokens
    expect(allowance).toBe(100n);
  });

  it("erc721_approve_all_revoke", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    expect(allowance).toBe(undefined);
  });

  it("erc721_approve_all_multi", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // operator approved → approvedAll adds 100 tokens
    expect(allowance).toBe(100n);
  });

  it("erc721_approve_all_multi_revoke_one", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    expect(allowance).toBe(100n);
  });

  it("erc721_approve_all_multi_revoke_all", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC721_ADDRESS);
    expect(allowance).toBe(undefined);
  });
});

describe("simulate erc721 purchase", () => {
  it("erc721_purchase_transferred", async () => {
    const result = await simulate();
    // caller sends 1 ETH STRK to router, receives 1 ERC721 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc721Diff).toBe(1n);
  });

  it("erc721_purchase_approved", async () => {
    const result = await simulate();
    // caller approves 1 ETH STRK, router pulls it and mints 1 ERC721
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    const strkAllowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc721Diff).toBe(1n);
    expect(strkAllowance).toBe(0n);
  });

  it("erc721_purchase_approved_over", async () => {
    const result = await simulate();
    // caller approves 5 ETH STRK but router only pulls 1 ETH, mints 1 ERC721
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    const strkAllowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc721Diff).toBe(1n);
    expect(strkAllowance).toBe(4n * ONE_ETH);
  });
});

describe("simulate erc1155", () => {
  it("erc1155_single_transfer", async () => {
    const result = await simulate();
    const diff = getBalanceDiff(result, ERC1155_ADDRESS);
    expect(diff).toBe(-2n);
  });

  it("erc1155_multi_transfer", async () => {
    const result = await simulate();
    const diff = getBalanceDiff(result, ERC1155_ADDRESS);
    expect(diff).toBe(-5n);
  });

  it("erc1155_single_batch_transfer", async () => {
    const result = await simulate();
    const diff = getBalanceDiff(result, ERC1155_ADDRESS);
    // 2 of token_id=1 + 1 of token_id=2 = 3 total sent
    expect(diff).toBe(-3n);
  });

  it("erc1155_multi_batch_transfer", async () => {
    const result = await simulate();
    const diff = getBalanceDiff(result, ERC1155_ADDRESS);
    // 2 of token_id=1 + 1 of token_id=2 = 3 total sent
    expect(diff).toBe(-3n);
  });

  it("erc1155_approve_all", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC1155_ADDRESS);
    // operator approved → approvedAll adds 100 tokens
    expect(allowance).toBe(100n);
  });

  it("erc1155_approve_all_multi", async () => {
    const result = await simulate();
    const allowance = getAllowances(result, ERC1155_ADDRESS);
    // multiple operators approved → approvedAll adds 100 tokens
    expect(allowance).toBe(100n);
  });
});
