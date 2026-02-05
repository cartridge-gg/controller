import {
  formatBalance,
  convertTokenAmountToUSD,
  convertUSDToTokenAmount,
} from "./tokens";

describe("formatBalance", () => {
  const testCases = [
    {
      description: "formats whole numbers without decimals",
      input: { amount: BigInt("1000000000000000000"), decimals: 18 },
      expected: "1",
    },
    {
      description: "formats numbers with decimals",
      input: { amount: BigInt("1234567890000000000"), decimals: 18 },
      expected: "1.23",
    },
    {
      description: "handles zero amount",
      input: { amount: BigInt("0"), decimals: 18 },
      expected: "0",
    },
    {
      description: "formats very small numbers",
      input: { amount: BigInt("1000000000000"), decimals: 18 },
      expected: "0.000001",
    },
    {
      description: "handles numbers with trailing zeros",
      input: { amount: BigInt("1200000000000000000"), decimals: 18 },
      expected: "1.2",
    },
    {
      description: "formats large numbers",
      input: { amount: BigInt("123456789000000000000"), decimals: 18 },
      expected: "123.46",
    },
    {
      description: "handles different decimal places",
      input: { amount: BigInt("12345"), decimals: 4 },
      expected: "1.23",
    },
    {
      description: "handles very small non-zero numbers",
      input: { amount: BigInt("1"), decimals: 18 },
      expected: "0.000000000000000001",
    },
  ];

  testCases.forEach(({ description, input, expected }) => {
    it(description, () => {
      const result = formatBalance(input.amount, input.decimals);
      expect(result).toBe(expected);
    });
  });

  it("uses default decimals (18) when not specified", () => {
    const result = formatBalance(BigInt("1000000000000000000"));
    expect(result).toBe("1");
  });

  it("handles invalid inputs gracefully", () => {
    expect(() => formatBalance(BigInt("-1"), 18)).not.toThrow();
    expect(() => formatBalance(BigInt("0"), 0)).not.toThrow();
  });
});

describe("formatUSDBalance", () => {
  const testCases = [
    {
      description: "formats whole dollar amounts",
      input: {
        amount: BigInt("1000000000000000000"),
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: "$1",
    },
    {
      description: "formats decimal dollar amounts",
      input: {
        amount: BigInt("1234567890000000000"),
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: "$1.23",
    },
    {
      description: "formats rounded values",
      input: {
        amount: BigInt("1234567890000000000"),
        decimals: 18,
        price: { amount: "1234567890000000000", decimals: 18 },
      },
      expected: "$1.52",
    },
    {
      description: "handles zero amount",
      input: {
        amount: BigInt("0"),
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: "$0",
    },
    {
      description: "handles very small dollar amounts",
      input: {
        amount: BigInt("1000000000000"),
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: "<$0.001",
    },
    {
      description: "handles different token and price decimals",
      input: {
        amount: BigInt("100000"),
        decimals: 6,
        price: { amount: "500000", decimals: 5 },
      },
      expected: "$0.50",
    },
    {
      description: "handles different token and price decimals",
      input: {
        amount: BigInt("1000"),
        decimals: 6,
        price: { amount: "500000", decimals: 5 },
      },
      expected: "$0.005",
    },
    {
      description: "handles different token and price decimals",
      input: {
        amount: BigInt("1000"),
        decimals: 6,
        price: { amount: "250000", decimals: 5 },
      },
      expected: "$0.003",
    },
    {
      description: "handles different token and price decimals",
      input: {
        amount: BigInt("10000"),
        decimals: 6,
        price: { amount: "250000", decimals: 5 },
      },
      expected: "$0.025",
    },
    {
      description: "formats large dollar amounts",
      input: {
        amount: BigInt("5000000000000000000"),
        decimals: 18,
        price: { amount: "2000000000000000000", decimals: 18 },
      },
      expected: "$10",
    },
    {
      description:
        "always shows at least 2 decimal places for non-whole numbers",
      input: {
        amount: BigInt("1100000000000000000"),
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: "$1.10",
    },
  ];

  testCases.forEach(({ description, input, expected }) => {
    it(description, () => {
      const result = convertTokenAmountToUSD(
        input.amount,
        input.decimals,
        input.price,
      );
      expect(result).toBe(expected);
    });
  });

  it("handles invalid price data gracefully", () => {
    expect(() =>
      convertTokenAmountToUSD(BigInt("1000000000000000000"), 18, {
        amount: "0",
        decimals: 18,
      }),
    ).not.toThrow();
  });
});

describe("convertUSDToAmount", () => {
  const testCases = [
    {
      description: "converts whole dollar amounts",
      input: {
        usdAmount: 1,
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: BigInt("1000000000000000000"),
    },
    {
      description: "converts decimal dollar amounts",
      input: {
        usdAmount: 1.23,
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: BigInt("1230000000000000000"),
    },
    {
      description: "handles different token and price decimals",
      input: {
        usdAmount: 0.5,
        decimals: 6,
        price: { amount: "500000", decimals: 5 },
      },
      expected: BigInt("100000"),
    },
    {
      description: "handles very small dollar amounts",
      input: {
        usdAmount: 0.001,
        decimals: 18,
        price: { amount: "1000000000000000000", decimals: 18 },
      },
      expected: BigInt("1000000000000000"),
    },
    {
      description: "handles large token amounts and prices",
      input: {
        usdAmount: 1000000, // $1M
        decimals: 18,
        price: { amount: "1000000000000000000000", decimals: 18 }, // $1000 per token
      },
      expected: BigInt("1000000000000000000000"), // 1M * 10^18 / 1000
    },
    {
      description:
        "handles very large prices without scientific notation issues",
      input: {
        usdAmount: 1,
        decimals: 18,
        price: { amount: "100000000000000000000000000000", decimals: 18 }, // $100B per token
      },
      expected: BigInt("10000000"), // 1 * 10^18 / 100B
    },
  ];

  testCases.forEach(({ description, input, expected }) => {
    it(description, () => {
      const result = convertUSDToTokenAmount(
        input.usdAmount,
        input.decimals,
        input.price,
      );
      expect(result).toBe(expected);
    });
  });

  it("maintains inverse relationship with convertAmountToUSD", () => {
    const testAmount = 1.23; // USD
    const decimals = 18;
    const price = { amount: "1000000000000000000", decimals: 18 };

    const tokenAmount = convertUSDToTokenAmount(testAmount, decimals, price);
    const backToUSD = convertTokenAmountToUSD(tokenAmount, decimals, price);

    expect(backToUSD).toBe("$1.23");
  });

  it("maintains precision with large numbers", () => {
    const largePrice = "123456789123456789123456789"; // A very large price
    const testAmount = 9999999.99; // A large USD amount
    const decimals = 18;
    const price = { amount: largePrice, decimals: 18 };

    const tokenAmount = convertUSDToTokenAmount(testAmount, decimals, price);
    const backToUSD = convertTokenAmountToUSD(tokenAmount, decimals, price);

    // Should maintain precision and round to nearest cent
    expect(backToUSD).toBe("$9,999,999.99");
  });
});
