import { StarterPack, StarterPackItemType } from "@cartridge/controller";
import { usdcToUsd } from "../starterpack";

describe("Purchase page display fixes", () => {
  const mockCustomStarterPack: StarterPack = {
    name: "Premium Gaming Pack",
    description: "A comprehensive gaming starter pack",
    items: [
      {
        type: StarterPackItemType.NONFUNGIBLE,
        name: "Legendary Sword NFT",
        description: "A rare legendary sword with +100 damage",
        amount: 1,
        price: BigInt("4950000"), // 4.95 USDC
      },
      {
        type: StarterPackItemType.FUNGIBLE,
        name: "Game Credits",
        description: "In-game premium currency",
        amount: 50,
        price: BigInt("50000"), // 0.05 USDC each
      },
      {
        type: StarterPackItemType.NONFUNGIBLE,
        name: "Rare Shield NFT",
        description: "A magical shield providing defense",
        amount: 1,
        price: BigInt("1250000"), // 1.25 USDC
      },
    ],
  };

  describe("Individual item price display (Badge component)", () => {
    it("should display correct USD prices for each item in 'You receive' section", () => {
      const items = mockCustomStarterPack.items;

      // Test each item's price conversion for display
      const item1PriceUsd = usdcToUsd(items[0].price!);
      expect(item1PriceUsd).toBe(4.95); // Legendary Sword: $4.95

      const item2PriceUsd = usdcToUsd(items[1].price!);
      expect(item2PriceUsd).toBe(0.05); // Game Credits: $0.05 each

      const item3PriceUsd = usdcToUsd(items[2].price!);
      expect(item3PriceUsd).toBe(1.25); // Rare Shield: $1.25
    });

    it("should demonstrate the before/after fix for Badge component", () => {
      const item = mockCustomStarterPack.items[0]; // Legendary Sword

      // OLD WAY (incorrect): Number(price) treated USDC micro-units as dollars
      const oldWayIncorrect = Number(item.price);
      expect(oldWayIncorrect).toBe(4950000); // Would show $4,950,000 badge!

      // NEW WAY (correct): usdcToUsd converts properly
      const newWayCorrect = usdcToUsd(item.price!);
      expect(newWayCorrect).toBe(4.95); // Shows correct $4.95 badge
    });
  });

  describe("Purchase context item values", () => {
    it("should calculate correct individual item values for purchase context", () => {
      // Simulating what happens in purchase context
      const purchaseItems = mockCustomStarterPack.items.map((item) => {
        const itemPriceUsd = item.price
          ? usdcToUsd(item.price) * (item.amount || 1)
          : 0;

        return {
          title: item.name,
          subtitle: item.description,
          value: itemPriceUsd, // This is what gets displayed
        };
      });

      // Check individual item values
      expect(purchaseItems[0].value).toBe(4.95); // 1 × $4.95 = $4.95
      expect(purchaseItems[1].value).toBe(2.5); // 50 × $0.05 = $2.50
      expect(purchaseItems[2].value).toBe(1.25); // 1 × $1.25 = $1.25

      // Total should be $8.70
      const totalValue = purchaseItems.reduce(
        (sum, item) => sum + item.value,
        0,
      );
      expect(totalValue).toBe(8.7);
    });

    it("should handle items with different amounts correctly", () => {
      const multiAmountItem = mockCustomStarterPack.items[1]; // 50 Game Credits at $0.05 each

      const totalItemValue =
        usdcToUsd(multiAmountItem.price!) * (multiAmountItem.amount || 1);
      expect(totalItemValue).toBe(2.5); // 50 × $0.05 = $2.50
    });
  });

  describe("Free items display", () => {
    it("should handle items without prices correctly", () => {
      const freeItem = {
        type: StarterPackItemType.NONFUNGIBLE,
        name: "Free Welcome NFT",
        description: "A welcome gift NFT",
        amount: 1,
        price: undefined as bigint | undefined,
        // No price field (free item)
      };

      const displayPrice = freeItem.price ? usdcToUsd(freeItem.price) : 0;
      expect(displayPrice).toBe(0); // Should display as FREE
    });
  });
});
