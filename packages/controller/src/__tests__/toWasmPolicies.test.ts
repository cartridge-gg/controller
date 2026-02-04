import { toWasmPolicies } from "../utils";
import { ParsedSessionPolicies } from "../policies";

describe("toWasmPolicies", () => {
  describe("canonical ordering", () => {
    test("sorts contracts by address regardless of input order", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xAAA": {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
          "0xBBB": {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
        },
      };

      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xBBB": {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
          "0xAAA": {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);
      // First policy should be for 0xAAA (sorted alphabetically)
      expect(result1[0]).toHaveProperty("target", "0xAAA");
      expect(result1[1]).toHaveProperty("target", "0xBBB");
    });

    test("sorts methods within contracts by entrypoint", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xAAA": {
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
          "0xAAA": {
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
          "0xCCC": {
            methods: [
              { entrypoint: "c_method", authorized: true },
              { entrypoint: "a_method", authorized: true },
            ],
          },
          "0xAAA": {
            methods: [
              { entrypoint: "z_method", authorized: true },
              { entrypoint: "a_method", authorized: true },
            ],
          },
          "0xBBB": {
            methods: [{ entrypoint: "b_method", authorized: true }],
          },
        },
      };

      // Same policies in different order
      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xBBB": {
            methods: [{ entrypoint: "b_method", authorized: true }],
          },
          "0xAAA": {
            methods: [
              { entrypoint: "a_method", authorized: true },
              { entrypoint: "z_method", authorized: true },
            ],
          },
          "0xCCC": {
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

      // Verify order: 0xAAA first, then 0xBBB, then 0xCCC
      // Within 0xAAA: a_method before z_method
      expect(result1[0]).toHaveProperty("target", "0xAAA");
      expect(result1[2]).toHaveProperty("target", "0xBBB");
      expect(result1[3]).toHaveProperty("target", "0xCCC");
    });

    test("handles case-insensitive address sorting", () => {
      const policies1: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xaaa": {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
          "0xAAB": {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
        },
      };

      const policies2: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xAAB": {
            methods: [{ entrypoint: "bar", authorized: true }],
          },
          "0xaaa": {
            methods: [{ entrypoint: "foo", authorized: true }],
          },
        },
      };

      const result1 = toWasmPolicies(policies1);
      const result2 = toWasmPolicies(policies2);

      expect(result1).toEqual(result2);
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
    test("creates ApprovalPolicy for approve methods with spender and amount", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xTOKEN": {
            methods: [
              {
                entrypoint: "approve",
                spender: "0xSPENDER",
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
        target: "0xTOKEN",
        spender: "0xSPENDER",
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
          "0xTOKEN": {
            methods: [
              {
                entrypoint: "approve",
                spender: "0xSPENDER",
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
          "0xTOKEN": {
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
          "0xTOKEN": {
            methods: [
              {
                entrypoint: "approve",
                spender: "0xSPENDER",
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
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xCONTRACT": {
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
      expect(result[0]).toHaveProperty("target", "0xCONTRACT");
      expect(result[0]).toHaveProperty("method");
      expect(result[0]).toHaveProperty("authorized", true);
    });

    test("handles mixed approve and non-approve methods", () => {
      const policies: ParsedSessionPolicies = {
        verified: false,
        contracts: {
          "0xTOKEN": {
            methods: [
              {
                entrypoint: "approve",
                spender: "0xSPENDER",
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
      expect(approvePolicy).toHaveProperty("spender", "0xSPENDER");
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
          "0xTOKEN": {
            methods: [
              { entrypoint: "transfer", authorized: true },
              {
                entrypoint: "approve",
                spender: "0xSPENDER",
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
