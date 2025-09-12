import { StarterPack, StarterPackItemType } from "@cartridge/controller";
import { calculateStarterPackPrice, usdcToUsd } from "../starterpack";

describe("starterpack price calculations", () => {
  describe("usdcToUsd", () => {
    it("should correctly convert USDC (6 decimals) to USD", () => {
      expect(usdcToUsd(BigInt("1000000"))).toBe(1.0); // 1.00 USDC
      expect(usdcToUsd(BigInt("2500000"))).toBe(2.5); // 2.50 USDC
      expect(usdcToUsd(BigInt("500000"))).toBe(0.5); // 0.50 USDC
      expect(usdcToUsd(BigInt("50000"))).toBe(0.05); // 0.05 USDC
      expect(usdcToUsd(BigInt("1"))).toBe(0.000001); // 0.000001 USDC (1 microUSDC)
      expect(usdcToUsd(BigInt("0"))).toBe(0); // 0 USDC
    });
  });

  describe("calculateStarterPackPrice with USDC prices", () => {
    it("should calculate total price correctly for custom starter pack", () => {
      const starterPack: StarterPack = {
        name: "Test Pack",
        description: "Test Description",
        items: [
          {
            type: StarterPackItemType.NONFUNGIBLE,
            name: "NFT Item",
            description: "NFT Description",
            amount: 1,
            price: BigInt("1500000"), // 1.50 USDC
          },
          {
            type: StarterPackItemType.FUNGIBLE,
            name: "Token Item",
            description: "Token Description",
            amount: 10,
            price: BigInt("250000"), // 0.25 USDC each
          },
        ],
      };

      const totalPriceUsdc = calculateStarterPackPrice(starterPack);
      expect(totalPriceUsdc).toBe(BigInt("4000000")); // 1.50 + (10 * 0.25) = 4.00 USDC

      const totalPriceUsd = usdcToUsd(totalPriceUsdc);
      expect(totalPriceUsd).toBe(4.0); // Should be exactly 4.00 USD
    });

    it("should handle items without prices", () => {
      const starterPack: StarterPack = {
        name: "Free Pack",
        description: "Free Description",
        items: [
          {
            type: StarterPackItemType.NONFUNGIBLE,
            name: "Free NFT",
            description: "Free NFT Description",
            amount: 1,
            // No price field
          },
        ],
      };

      const totalPrice = calculateStarterPackPrice(starterPack);
      expect(totalPrice).toBe(BigInt("0"));
      expect(usdcToUsd(totalPrice)).toBe(0);
    });
  });
});
