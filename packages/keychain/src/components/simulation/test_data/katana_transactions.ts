import type { Call } from "starknet";

export const KATANA_RPC_URL = "http://localhost:5050";

// Katana accounts
export const CALLER =
  "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec";
export const OPERATOR =
  "0x13d9ee239f33fea4f8785b9e3870ade909e20a9599ae7cd62c1c292b73af1b7";
export const RECIPIENT1 =
  "0x17cc6ca902ed4e8baa8463a7009ff18cc294fa85a94b4ce6ac30a9ebd6057c7";
export const RECIPIENT2 =
  "0x2af9427c5a277474c079a1283c880ee8a6f0f8fbf73ce969c08d88befec1bba";

// contracts: https://github.com/rsodre/starknet_simulation
export const ERC20_ADDRESS =
  "0x028e156a25dfde6fc4a06fead9df08e0f77b31dda5d09f36878e3cdea819a781";
export const ERC721_ADDRESS =
  "0x0405c073447f1bfc25b35e987aefc03f8f64a45e1993a0362e2a5a195111f61d";
export const ERC1155_ADDRESS =
  "0x07f6f20d1993a0caeb38e753032fe6443aee2ff692abf3cb4552fdde1d66fa8a";
export const STRK_ADDRESS =
  "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const ROUTER_ADDRESS =
  "0x0449e1627f49a8597809b0df7236f9e3ad42ecf935b000cd9f89060efb87987b";

export const ONE_ETH = 1_000_000_000_000_000_000n;

// erc-20

export const erc20_transfers: Call[] = [
  {
    contractAddress: ERC20_ADDRESS,
    entrypoint: "transfer",
    calldata: [RECIPIENT1, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ERC20_ADDRESS,
    entrypoint: "transfer",
    calldata: [RECIPIENT1, 10n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: ERC20_ADDRESS,
    entrypoint: "transfer",
    calldata: [RECIPIENT2, 9n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "transfer",
    calldata: [RECIPIENT1, 3n * ONE_ETH, "0x0"],
  },
];

export const erc20_approvals: Call[] = [
  {
    contractAddress: ERC20_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ERC20_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, 10n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: ERC20_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT2, 9n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, 3n * ONE_ETH, "0x0"],
  },
];

// send STRK, receive ERC20
export const erc20_swap_transferred: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "transfer",
    calldata: [ROUTER_ADDRESS, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "swap_transferred",
    calldata: [ONE_ETH, "0x0"],
  },
];
export const erc20_swap_transferred_over: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "transfer",
    calldata: [ROUTER_ADDRESS, 5n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "swap_transferred",
    calldata: [ONE_ETH, "0x0"],
  },
];

// send STRK, receive ERC20
export const erc20_swap_approved: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [ROUTER_ADDRESS, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "swap_approved",
    calldata: [ONE_ETH, "0x0"],
  },
];
export const erc20_swap_approved_over: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [ROUTER_ADDRESS, 4n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "swap_approved",
    calldata: [ONE_ETH, "0x0"],
  },
];
export const erc20_swap_approved_extra_before: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, 3n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [ROUTER_ADDRESS, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "swap_approved",
    calldata: [ONE_ETH, "0x0"],
  },
];
export const erc20_swap_approved_extra_after: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [ROUTER_ADDRESS, ONE_ETH, "0x0"],
  },
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, 3n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "swap_approved",
    calldata: [ONE_ETH, "0x0"],
  },
];

// erc-721

export const erc721_transfers: Call[] = [
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "transfer_from",
    calldata: [CALLER, RECIPIENT1, "0x1", "0x0"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "transfer_from",
    calldata: [CALLER, RECIPIENT1, "0x2", "0x0"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "transfer_from",
    calldata: [CALLER, RECIPIENT2, "0x3", "0x0"],
  },
];

export const erc721_approvals: Call[] = [
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, "0x1", "0x0"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT1, "0x2", "0x0"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "approve",
    calldata: [RECIPIENT2, "0x3", "0x0"],
  },
];

export const erc721_approve_all: Call[] = [
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [OPERATOR, "0x1"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [OPERATOR, "0x0"],
  },
];

export const erc721_approve_all_multi: Call[] = [
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [OPERATOR, "0x1"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [RECIPIENT1, "0x1"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [OPERATOR, "0x0"],
  },
  {
    contractAddress: ERC721_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [RECIPIENT1, "0x0"],
  },
];

// send STRK, receive ERC721
export const erc721_purchase_transferred: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "transfer",
    calldata: [ROUTER_ADDRESS, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "purchase_erc721_transferred",
    calldata: [],
  },
];

// approve STRK, receive ERC721 (exact)
export const erc721_purchase_approved: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [ROUTER_ADDRESS, ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "purchase_erc721_approved",
    calldata: [ONE_ETH, "0x0"],
  },
];

// approve STRK, receive ERC721 (over-approved)
export const erc721_purchase_approved_over: Call[] = [
  {
    contractAddress: STRK_ADDRESS,
    entrypoint: "approve",
    calldata: [ROUTER_ADDRESS, 5n * ONE_ETH, "0x0"],
  },
  {
    contractAddress: ROUTER_ADDRESS,
    entrypoint: "purchase_erc721_approved",
    calldata: [ONE_ETH, "0x0"],
  },
];

// erc-1155
// CALLER holds: token_id=1 (qty=3), token_id=2 (qty=1)

// multi transfer_from: send 1 of token_id=1 + 1 of token_id=2
export const erc1155_transfers: Call[] = [
  // 2 x id 1
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "transfer_from",
    calldata: [CALLER, RECIPIENT1, "0x1", "0x0", "0x2", "0x0"],
  },
  // 1 x id 1
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "transfer_from",
    calldata: [CALLER, RECIPIENT2, "0x1", "0x0", "0x1", "0x0"],
  },
  // 2 x id 2
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "transfer_from",
    calldata: [CALLER, RECIPIENT1, "0x2", "0x0", "0x2", "0x0"],
  },
];

export const erc1155_batch_transfers: Call[] = [
  // batch_transfer_from: send 2 of token_id=1 and 1 of token_id=2 in one call
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "batch_transfer_from",
    calldata: [
      CALLER,
      RECIPIENT1,
      "0x2",
      "0x1",
      "0x0",
      "0x2",
      "0x0",
      "0x2",
      "0x2",
      "0x0",
      "0x1",
      "0x0",
    ],
  },
];

// set_approval_for_all: approve one operator
export const erc1155_approve_all: Call[] = [
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [OPERATOR, "0x1"],
  },
];

// set_approval_for_all: approve two operators
export const erc1155_approve_all_multi: Call[] = [
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [OPERATOR, "0x1"],
  },
  {
    contractAddress: ERC1155_ADDRESS,
    entrypoint: "set_approval_for_all",
    calldata: [RECIPIENT1, "0x1"],
  },
];
