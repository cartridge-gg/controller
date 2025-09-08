import { StarterPack, StarterPackItemType } from "@cartridge/controller";
import { encodeStarterPack, decodeStarterPack } from "../starterpack-url";

describe("starterpack-url", () => {
  const mockStarterPack: StarterPack = {
    name: "Test Starter Pack",
    description: "A test starter pack for verification",
    iconURL: "https://example.com/icon.png",
    items: [
      {
        type: StarterPackItemType.NONFUNGIBLE,
        name: "Test NFT",
        description: "A test NFT item",
        iconURL: "https://example.com/nft.png",
        amount: 1,
        price: BigInt("1000000000000000000"), // 1 ETH in wei
      },
      {
        type: StarterPackItemType.FUNGIBLE,
        name: "Test Token",
        description: "A test fungible token",
        amount: 100,
        price: BigInt("5000000000000000000"), // 5 ETH in wei
      },
    ],
  };

  describe("encodeStarterPackToUrl", () => {
    it("should encode a StarterPack to URL-safe base64", () => {
      const encoded = encodeStarterPack(mockStarterPack);

      // Should be a string
      expect(typeof encoded).toBe("string");

      // Should not contain URL-unsafe characters
      expect(encoded).not.toMatch(/[+/=]/);

      // Should be able to decode back
      const decoded = decodeStarterPack(encoded);
      expect(decoded).toEqual(mockStarterPack);
    });

    it("should handle StarterPack without prices", () => {
      const starterPackNoPrices: StarterPack = {
        ...mockStarterPack,
        items: mockStarterPack.items.map((item) => ({
          ...item,
          price: undefined,
        })),
      };

      const encoded = encodeStarterPack(starterPackNoPrices);
      const decoded = decodeStarterPack(encoded);

      expect(decoded).toEqual(starterPackNoPrices);
    });
  });

  describe("decodeStarterPack", () => {
    it("should decode URL-safe base64 to StarterPack", () => {
      const encoded = encodeStarterPack(mockStarterPack);
      const decoded = decodeStarterPack(encoded);

      expect(decoded.name).toBe(mockStarterPack.name);
      expect(decoded.description).toBe(mockStarterPack.description);
      expect(decoded.iconURL).toBe(mockStarterPack.iconURL);
      expect(decoded.items).toHaveLength(2);

      // Check that BigInt prices are correctly restored
      expect(decoded.items[0].price).toBe(BigInt("1000000000000000000"));
      expect(decoded.items[1].price).toBe(BigInt("5000000000000000000"));
    });

    it("should throw on invalid encoded data", () => {
      expect(() => decodeStarterPack("invalid-data")).toThrow();
    });
  });

  describe("roundtrip encoding/decoding", () => {
    it("should preserve all data through encode/decode cycle", () => {
      const encoded = encodeStarterPack(mockStarterPack);
      const decoded = decodeStarterPack(encoded);

      // Compare properties individually since BigInt can't be JSON.stringify'd
      expect(decoded.name).toBe(mockStarterPack.name);
      expect(decoded.description).toBe(mockStarterPack.description);
      expect(decoded.iconURL).toBe(mockStarterPack.iconURL);
      expect(decoded.items.length).toBe(mockStarterPack.items.length);

      decoded.items.forEach((item, index) => {
        const originalItem = mockStarterPack.items[index];
        expect(item.type).toBe(originalItem.type);
        expect(item.name).toBe(originalItem.name);
        expect(item.description).toBe(originalItem.description);
        expect(item.iconURL).toBe(originalItem.iconURL);
        expect(item.amount).toBe(originalItem.amount);
        expect(item.price).toBe(originalItem.price);
      });
    });

    it("should handle edge cases", () => {
      const edgeCaseStarterPack: StarterPack = {
        name: "Edge Case Pack",
        description:
          "Contains special characters: !@#$%^&*()_+-=[]{}|;':\",./<>?",
        items: [],
      };

      const encoded = encodeStarterPack(edgeCaseStarterPack);
      const decoded = decodeStarterPack(encoded);

      expect(decoded).toEqual(edgeCaseStarterPack);
    });
  });
});
