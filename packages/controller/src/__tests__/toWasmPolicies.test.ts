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
});
