import { getChecksumAddress } from "starknet";
import { toWasmPolicies } from "../utils";
import { ParsedSessionPolicies } from "../policies";

// Valid hex addresses for testing (short but valid for getChecksumAddress)
const ADDR_A = "0x0aaa";
const ADDR_B = "0x0bbb";
const ADDR_C = "0x0ccc";

// Pre-compute checksummed forms
const ADDR_A_CS = getChecksumAddress(ADDR_A);
const ADDR_B_CS = getChecksumAddress(ADDR_B);
const ADDR_C_CS = getChecksumAddress(ADDR_C);

describe("toWasmPolicies", () => {
  describe("canonical ordering", () => {
    test("sorts contracts by address regardless of input order", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [ADDR_A]: {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
          [ADDR_B]: {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
        },
      };

      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [ADDR_B]: {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
          [ADDR_A]: {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);
      // First policy should be for ADDR_A (sorted alphabetically)
      expect(result1[0]).toHaveProperty("target", ADDR_A_CS);
      expect(result1[1]).toHaveProperty("target", ADDR_B_CS);
    });

    test("sorts methods within contracts by entrypoint", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [ADDR_A]: {
            methods: [
              { entrypoint: "zebra", authorized: true },
              { entrypoint: "apple", authorized: true },
              { entrypoint: "mango", authorized: true },
            ],
          },
        },
      };

      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [ADDR_A]: {
            methods: [
              { entrypoint: "mango", authorized: true },
              { entrypoint: "zebra", authorized: true },
              { entrypoint: "apple", authorized: true },
            ],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);
    });

    test("produces consistent output for complex policies", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [ADDR_C]: {
            methods: [
              { entrypoint: "c_method", authorized: true },
              { entrypoint: "a_method", authorized: true },
            ],
          },
          [ADDR_A]: {
            methods: [
              { entrypoint: "z_method", authorized: true },
              { entrypoint: "a_method", authorized: true },
            ],
          },
          [ADDR_B]: {
            methods: [{ entrypoint: "b_method", authorized: true }],
          },
        },
      };

      // Same policies in different order
      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [ADDR_B]: {
            methods: [{ entrypoint: "b_method", authorized: true }],
          },
          [ADDR_A]: {
            methods: [
              { entrypoint: "a_method", authorized: true },
              { entrypoint: "z_method", authorized: true },
            ],
          },
          [ADDR_C]: {
            methods: [
              { entrypoint: "a_method", authorized: true },
              { entrypoint: "c_method", authorized: true },
            ],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);

      // Verify order: ADDR_A first, then ADDR_B, then ADDR_C
      // Within ADDR_A: a_method before z_method
      expect(result1[0]).toHaveProperty("target", ADDR_A_CS);
      expect(result1[2]).toHaveProperty("target", ADDR_B_CS);
      expect(result1[3]).toHaveProperty("target", ADDR_C_CS);
    });

    test("handles case-insensitive address sorting", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0x0aaa": {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
          "0x0AAB": {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
        },
      };

      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0x0AAB": {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
          "0x0aaa": {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);
    });

    test("normalizes address casing via getChecksumAddress", () => {
      const addr =
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [addr.toLowerCase()]: {
            methods: [{ entrypoint: "transfer", authorized: true }],
          },
        },
      };

      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [addr.toUpperCase().replace("0X", "0x")]: {
            methods: [{ entrypoint: "transfer", authorized: true }],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);
      expect(result1[0]).toHaveProperty("target", getChecksumAddress(addr));
    });

    test("handles empty policies", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {},
        messages: [],
      };

      const result = toWasmPolicies(policies);
      expect(result).toEqual([]);
    });

    test("handles undefined contracts and messages", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
      };

      const result = toWasmPolicies(policies);
      expect(result).toEqual([]);
    });
  });

  describe("ApprovalPolicy handling", () => {
    const TOKEN =
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const TOKEN_CS = getChecksumAddress(TOKEN);
    const SPENDER =
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

    test("creates ApprovalPolicy for approve methods with spender and amount", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [TOKEN]: {
            methods: [
              {
                entrypoint: "approve",
                spender: SPENDER,
                amount: "1000000000000000000",
                authorized: true,
              },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        target: TOKEN_CS,
        spender: SPENDER,
        amount: "1000000000000000000",
      });
      // Should NOT have method or authorized fields
      expect(result[0]).not.toHaveProperty("method");
      expect(result[0]).not.toHaveProperty("authorized");
    });

    test("converts numeric amount to string in ApprovalPolicy", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [TOKEN]: {
            methods: [
              {
                entrypoint: "approve",
                spender: SPENDER,
                amount: 1000000000000000000,
                authorized: true,
              },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result[0]).toHaveProperty("amount", "1000000000000000000");
    });

    test("falls back to CallPolicy for approve without spender", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [TOKEN]: {
            methods: [
              {
                entrypoint: "approve",
                authorized: true,
              },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("method");
      expect(result[0]).toHaveProperty("authorized", true);
      expect(result[0]).not.toHaveProperty("spender");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[DEPRECATED]"),
      );

      warnSpy.mockRestore();
    });

    test("falls back to CallPolicy for approve without amount", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [TOKEN]: {
            methods: [
              {
                entrypoint: "approve",
                spender: SPENDER,
                authorized: true,
              },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("method");
      expect(result[0]).not.toHaveProperty("spender");
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    test("creates CallPolicy for non-approve methods", () => {
      const CONTRACT =
        "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49";
      const CONTRACT_CS = getChecksumAddress(CONTRACT);

      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [CONTRACT]: {
            methods: [
              {
                entrypoint: "transfer",
                authorized: true,
              },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("target", CONTRACT_CS);
      expect(result[0]).toHaveProperty("method");
      expect(result[0]).toHaveProperty("authorized", true);
    });

    test("handles mixed approve and non-approve methods", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [TOKEN]: {
            methods: [
              {
                entrypoint: "approve",
                spender: SPENDER,
                amount: "1000",
                authorized: true,
              },
              {
                entrypoint: "transfer",
                authorized: true,
              },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result).toHaveLength(2);

      // First should be approve (sorted alphabetically)
      const approvePolicy = result[0];
      expect(approvePolicy).toHaveProperty("spender", SPENDER);
      expect(approvePolicy).toHaveProperty("amount", "1000");

      // Second should be transfer
      const transferPolicy = result[1];
      expect(transferPolicy).toHaveProperty("method");
      expect(transferPolicy).toHaveProperty("authorized", true);
    });

    test("sorts approve policies correctly among other methods", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          [TOKEN]: {
            methods: [
              { entrypoint: "transfer", authorized: true },
              {
                entrypoint: "approve",
                spender: SPENDER,
                amount: "1000",
                authorized: true,
              },
              { entrypoint: "balance_of", authorized: true },
            ],
          },
        },
      };

      const result = toWasmPolicies(policies);

      expect(result).toHaveLength(3);
      // Sorted order: approve, balance_of, transfer
      expect(result[0]).toHaveProperty("spender"); // approve -> ApprovalPolicy
      expect(result[1]).toHaveProperty("method"); // balance_of -> CallPolicy
      expect(result[2]).toHaveProperty("method"); // transfer -> CallPolicy
    });
  });
});
