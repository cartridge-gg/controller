import { describe, it, expect } from "vitest";
import {
  prepareSwapCalls,
  type SwapCallsParams,
  type SwapQuote,
} from "./index";
import { uint256, constants } from "starknet";

// Must match SLIPPAGE_PERCENTAGE in index.ts
const SLIPPAGE_PERCENTAGE = 5n;
const applySlippage = (amount: bigint) =>
  amount + (amount * SLIPPAGE_PERCENTAGE) / 100n;

// Real token addresses (Sepolia)
const ETH_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const STRK_ADDRESS =
  "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const USDC_SEPOLIA =
  "0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080";

/**
 * Real Ekubo API response for purchasing with ETH when price is in STRK.
 * Request: 2.1 STRK (quantity=2, price=1.05 STRK each)
 * Response: Need ~0.0000647 ETH to get 2.1 STRK
 * Route: ETH -> USDC -> STRK (multi-hop)
 *
 * curl 'https://starknet-sepolia-quoter-api.ekubo.org/-2100000000000000000/0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d/0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
 */
const REAL_EKUBO_RESPONSE: SwapQuote = {
  impact: -0.4396089637732363,
  total: 64702977162095n, // ETH amount needed (parsed from "-64702977162095")
  splits: [
    {
      amount_specified: "-2100000000000000000", // 2.1 STRK requested
      route: [
        {
          pool_key: {
            token0: STRK_ADDRESS,
            token1: USDC_SEPOLIA,
            fee: "0x20c49ba5e353f80000000000000000",
            tick_spacing: 1000,
            extension: "0x0",
          },
          sqrt_ratio_limit: "0x8c0223097b1fd5baa9802828c2d",
          skip_ahead: 0,
        },
        {
          pool_key: {
            token0: ETH_ADDRESS,
            token1: USDC_SEPOLIA,
            fee: "0xccccccccccccccccccccccccccccccc",
            tick_spacing: 354892,
            extension:
              "0x73ec792c33b52d5f96940c2860d512b3884f2127d25e023eb9d44a678e4b971",
          },
          sqrt_ratio_limit: "0x1000003f7f1380b75",
          skip_ahead: 0,
        },
      ],
    },
  ],
};

// Helper to create a simple mock swap quote for basic tests
function createMockSwapQuote(
  total: bigint,
  amountSpecified: string,
): SwapQuote {
  return {
    impact: 0.001,
    total,
    splits: [
      {
        amount_specified: amountSpecified,
        route: [
          {
            pool_key: {
              token0: ETH_ADDRESS,
              token1: USDC_SEPOLIA,
              fee: "0x1",
              tick_spacing: 100,
              extension: "0x0",
            },
            sqrt_ratio_limit: "0x1",
            skip_ahead: 0,
          },
        ],
      },
    ],
  };
}

describe("prepareSwapCalls", () => {
  describe("real Ekubo response", () => {
    it("should correctly process real Ekubo multi-hop response (ETH -> USDC -> STRK)", () => {
      // Real scenario: Buying 2 items at 1.05 STRK each = 2.1 STRK total
      // Ekubo returns: need 64702977162095 wei ETH to get 2.1 STRK
      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: 2100000000000000000n, // 2.1 STRK (18 decimals)
        swapQuote: REAL_EKUBO_RESPONSE,
        chainId: constants.StarknetChainId.SN_SEPOLIA,
      };

      const result = prepareSwapCalls(params);

      // Verify approve call is for ETH (the token we're paying with)
      expect(result.approveCall.contractAddress).toBe(ETH_ADDRESS);
      expect(result.approveCall.entrypoint).toBe("approve");

      // Verify the approved amount is based on the real quote total (with 5% buffer)
      const approveCalldata = result.approveCall.calldata as string[];
      const approvedAmount = uint256.uint256ToBN({
        low: BigInt(approveCalldata[1]),
        high: BigInt(approveCalldata[2]),
      });

      // Expected: 64702977162095 * 1.05 = 67938126020199 (5% slippage buffer)
      const expectedApproveAmount = applySlippage(REAL_EKUBO_RESPONSE.total);
      expect(approvedAmount).toBe(expectedApproveAmount);

      // Verify swap calls are generated (transfer + swap + clear calls)
      expect(result.swapCalls.length).toBeGreaterThan(0);
      expect(result.allCalls.length).toBe(result.swapCalls.length + 1); // +1 for approve
    });

    it("should NOT double-scale real Ekubo quote when quantity > 1", () => {
      // The real response is already for quantity=2 (2.1 STRK = 1.05 * 2)
      // If we incorrectly scale by quantity again, we'd approve 4x too much
      const quantity = 2;

      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: 2100000000000000000n, // 2.1 STRK
        swapQuote: REAL_EKUBO_RESPONSE,
        chainId: constants.StarknetChainId.SN_SEPOLIA,
      };

      const result = prepareSwapCalls(params);
      const approveCalldata = result.approveCall.calldata as string[];
      const approvedAmount = uint256.uint256ToBN({
        low: BigInt(approveCalldata[1]),
        high: BigInt(approveCalldata[2]),
      });

      // CORRECT: ~0.0000679 ETH (64702977162095 * 1.05 buffer)
      const correctApproveAmount = applySlippage(REAL_EKUBO_RESPONSE.total);

      // WRONG (bug): If double-scaled, it would be ~0.000136 ETH (64702977162095 * 2 * 1.05)
      const wrongDoubleScaledAmount = applySlippage(
        REAL_EKUBO_RESPONSE.total * BigInt(quantity),
      );

      expect(approvedAmount).toBe(correctApproveAmount);
      expect(approvedAmount).not.toBe(wrongDoubleScaledAmount);
    });
  });

  describe("swap quote usage", () => {
    it("should use swapQuote.total directly without additional scaling", () => {
      // Simulate a swap quote that was already fetched for quantity=3
      // (i.e., quote.totalCost * 3 was passed to fetchSwapQuote)
      const swapTotalForQuantity3 = 150000000000000000n; // 0.15 ETH for 3 items
      const swapQuote = createMockSwapQuote(
        swapTotalForQuantity3,
        swapTotalForQuantity3.toString(),
      );

      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: 300000000n, // 300 USDC (for 3 items)
        swapQuote,
        chainId: constants.StarknetChainId.SN_MAIN,
      };

      const result = prepareSwapCalls(params);

      // The approve call should use the swap quote total (with slippage buffer)
      // NOT swapQuote.total * quantity (which would be double-scaling)
      const approveCalldata = result.approveCall.calldata as string[];

      // Reconstruct the approved amount from uint256
      const approvedAmount = uint256.uint256ToBN({
        low: BigInt(approveCalldata[1]),
        high: BigInt(approveCalldata[2]),
      });

      // The approved amount should be based on swapTotalForQuantity3 (with 5% buffer)
      // NOT swapTotalForQuantity3 * 3 (which would be incorrect double-scaling)
      const expectedApproveAmount = applySlippage(swapTotalForQuantity3);
      expect(approvedAmount).toBe(expectedApproveAmount);
    });

    it("should NOT double-scale when quantity > 1", () => {
      const quantity = 5;
      const basePricePerItem = 100000000n; // 100 USDC per item
      const totalCost = basePricePerItem * BigInt(quantity); // 500 USDC total

      // Swap quote fetched with total cost already includes quantity
      const swapTotalForQuantity = 250000000000000000n; // 0.25 ETH for 5 items
      const swapQuote = createMockSwapQuote(
        swapTotalForQuantity,
        swapTotalForQuantity.toString(),
      );

      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: totalCost,
        swapQuote,
        chainId: constants.StarknetChainId.SN_MAIN,
      };

      const result = prepareSwapCalls(params);
      const approveCalldata = result.approveCall.calldata as string[];
      const approvedAmount = uint256.uint256ToBN({
        low: BigInt(approveCalldata[1]),
        high: BigInt(approveCalldata[2]),
      });

      // CORRECT: Approved amount should be ~0.2625 ETH (0.25 * 1.05 buffer)
      // WRONG (bug): If double-scaled, it would be ~1.3125 ETH (0.25 * 5 * 1.05 buffer)
      const correctApproveAmount = applySlippage(swapTotalForQuantity);
      const wrongDoubleScaledAmount = applySlippage(
        swapTotalForQuantity * BigInt(quantity),
      );

      expect(approvedAmount).toBe(correctApproveAmount);
      expect(approvedAmount).not.toBe(wrongDoubleScaledAmount);
    });

    it("should apply 5% buffer for large amounts", () => {
      const largeSwapTotal = BigInt(1e19); // 10 ETH
      const swapQuote = createMockSwapQuote(
        largeSwapTotal,
        largeSwapTotal.toString(),
      );

      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: 10000000000n, // 10000 USDC
        swapQuote,
        chainId: constants.StarknetChainId.SN_MAIN,
      };

      const result = prepareSwapCalls(params);
      const approveCalldata = result.approveCall.calldata as string[];
      const approvedAmount = uint256.uint256ToBN({
        low: BigInt(approveCalldata[1]),
        high: BigInt(approveCalldata[2]),
      });

      // 5% buffer: 10 ETH * 1.05 = 10.5 ETH
      const expected = applySlippage(largeSwapTotal);
      expect(approvedAmount).toBe(expected);
    });
  });

  describe("call structure", () => {
    it("should generate approve call with correct contract address", () => {
      const swapQuote = createMockSwapQuote(
        100000000000000000n,
        "100000000000000000",
      );

      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: 100000000n,
        swapQuote,
        chainId: constants.StarknetChainId.SN_MAIN,
      };

      const result = prepareSwapCalls(params);

      expect(result.approveCall.contractAddress).toBe(ETH_ADDRESS);
      expect(result.approveCall.entrypoint).toBe("approve");
    });

    it("should return allCalls with approve first", () => {
      const swapQuote = createMockSwapQuote(
        100000000000000000n,
        "100000000000000000",
      );

      const params: SwapCallsParams = {
        selectedTokenAddress: ETH_ADDRESS,
        paymentToken: STRK_ADDRESS,
        totalCostWithQuantity: 100000000n,
        swapQuote,
        chainId: constants.StarknetChainId.SN_MAIN,
      };

      const result = prepareSwapCalls(params);

      expect(result.allCalls[0]).toBe(result.approveCall);
      expect(result.allCalls.length).toBeGreaterThan(1);
    });
  });
});

describe("swap total scaling", () => {
  // Helper to calculate expected swap total for a given quantity
  const calculateExpectedSwapTotal = (
    baseSwapTotal: bigint,
    quantity: number,
  ) => baseSwapTotal * BigInt(quantity);

  it("should correctly calculate swap total for quantity 1", () => {
    const baseSwapTotal = 50000000000000000n; // 0.05 ETH
    expect(calculateExpectedSwapTotal(baseSwapTotal, 1)).toBe(baseSwapTotal);
  });

  it("should correctly scale swap total by quantity", () => {
    const baseSwapTotal = 50000000000000000n; // 0.05 ETH
    const quantity = 3;
    expect(calculateExpectedSwapTotal(baseSwapTotal, quantity)).toBe(
      150000000000000000n, // 0.15 ETH
    );
  });

  it("should handle large quantities", () => {
    const baseSwapTotal = 100000000000000000n; // 0.1 ETH
    const quantity = 100;
    expect(calculateExpectedSwapTotal(baseSwapTotal, quantity)).toBe(
      10000000000000000000n, // 10 ETH
    );
  });
});
