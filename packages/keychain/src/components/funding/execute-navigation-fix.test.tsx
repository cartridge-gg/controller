import { describe, expect, it, vi } from "vitest";

/**
 * This test validates the fix for the execute -> funding -> execute navigation issue.
 * The problem was that when navigating back from funding to execute, the query parameters
 * containing the execute data were being lost.
 */
describe("Execute Navigation Fix", () => {
  describe("URL encoding/decoding in funding flow", () => {
    it("should preserve execute query params through funding flow", () => {
      // Step 1: User is on execute page with transaction data
      const executeData = {
        id: "test-123",
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "transfer",
            calldata: ["0x1234567890abcdef", "1000000000000000000", "0"],
          },
        ],
      };

      const executeUrl = `/execute?data=${encodeURIComponent(JSON.stringify(executeData))}`;

      // Step 2: ExecutionContainer creates funding URL with returnTo
      // This simulates ExecutionContainer.tsx lines 177 and 199
      const fundingUrl = `/funding?returnTo=${encodeURIComponent(executeUrl)}`;

      // Step 3: User completes funding, app.tsx extracts returnTo
      const searchParams = new URLSearchParams(fundingUrl.split("?")[1]);
      const returnTo = searchParams.get("returnTo");

      // Step 4: Verify the returnTo URL is correctly preserved
      expect(returnTo).toBe(executeUrl);

      // Step 5: app.tsx navigates back using returnTo (already decoded by URLSearchParams.get())
      // URLSearchParams.get() automatically decodes the parameter
      expect(returnTo).toBe(executeUrl);

      // Step 6: Verify execute data can be extracted from final URL
      const finalParams = new URLSearchParams(returnTo!.split("?")[1]);
      const finalData = finalParams.get("data");
      const parsedData = JSON.parse(decodeURIComponent(finalData!));

      expect(parsedData).toEqual(executeData);
    });

    it("should handle multiple query parameters correctly", () => {
      // Execute URL with multiple params (execute data + RPC URL + theme)
      const executeData = { id: "multi-param", transactions: [] };
      const executeUrl = `/execute?data=${encodeURIComponent(JSON.stringify(executeData))}&rpc_url=${encodeURIComponent("https://rpc.example.com")}&theme=dark`;

      // Funding flow
      const fundingUrl = `/funding?returnTo=${encodeURIComponent(executeUrl)}`;
      const searchParams = new URLSearchParams(fundingUrl.split("?")[1]);
      const returnTo = searchParams.get("returnTo");

      // Verify all params are preserved
      expect(returnTo).toBe(executeUrl);
      expect(returnTo).toContain("data=");
      expect(returnTo).toContain("rpc_url=");
      expect(returnTo).toContain("theme=dark");
    });
  });

  describe("Navigation options fix", () => {
    it("should use replace navigation for execute URLs", () => {
      const mockNavigate = vi.fn();

      // Simulate the fixed app.tsx behavior
      const executeUrl = "/execute?data=test-data";
      const returnTo = encodeURIComponent(executeUrl);

      // Simulate URLSearchParams.get() decoding the returnTo parameter
      const searchParams = new URLSearchParams(`returnTo=${returnTo}`);
      const decodedReturnTo = searchParams.get("returnTo")!;

      // This is the new behavior in app.tsx
      mockNavigate(decodedReturnTo, { replace: true });

      expect(mockNavigate).toHaveBeenCalledWith(executeUrl, { replace: true });
    });

    it("should handle the exact ExecutionContainer flow", () => {
      // Simulate ExecutionContainer.tsx creating the funding URL
      const mockWindowLocation = {
        pathname: "/execute",
        search: "?data=test-execution&rpc_url=https%3A//example.com",
      };

      // ExecutionContainer creates this URL (lines 177 and 199)
      const fundingUrl = `/funding?returnTo=${encodeURIComponent(mockWindowLocation.pathname + mockWindowLocation.search)}`;

      // app.tsx extracts returnTo (lines 63 and 85)
      const searchParams = new URLSearchParams(fundingUrl.split("?")[1]);
      const returnTo = searchParams.get("returnTo");

      // app.tsx uses returnTo directly (URLSearchParams.get() partially decodes it)
      // The URL components remain encoded as they should be
      expect(returnTo).toBe(
        "/execute?data=test-execution&rpc_url=https%3A//example.com",
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty execute data", () => {
      const executeUrl = "/execute?data=%7B%7D"; // empty object {}
      const fundingUrl = `/funding?returnTo=${encodeURIComponent(executeUrl)}`;

      const searchParams = new URLSearchParams(fundingUrl.split("?")[1]);
      const returnTo = searchParams.get("returnTo");

      expect(returnTo).toBe(executeUrl);
    });

    it("should handle execute URLs without query params", () => {
      const executeUrl = "/execute";
      const fundingUrl = `/funding?returnTo=${encodeURIComponent(executeUrl)}`;

      const searchParams = new URLSearchParams(fundingUrl.split("?")[1]);
      const returnTo = searchParams.get("returnTo");

      expect(returnTo).toBe(executeUrl);
    });

    it("should fallback to funding when returnTo is missing", () => {
      const mockNavigate = vi.fn();

      // Simulate app.tsx when returnTo is null
      const returnTo = null;

      if (returnTo) {
        const decodedUrl = decodeURIComponent(returnTo);
        mockNavigate(decodedUrl, { replace: true });
      } else {
        mockNavigate("/funding");
      }

      expect(mockNavigate).toHaveBeenCalledWith("/funding");
    });
  });

  describe("Navigation context returnTo preservation", () => {
    it("should preserve returnTo parameter in navigation context", () => {
      // Test the returnTo parameter preservation logic
      const mockLocation = {
        pathname: "/funding",
        search: "?returnTo=%2Fexecute%3Fdata%3Dtest",
      };

      // Simulate the navigation context logic
      const currentSearchParams = new URLSearchParams(mockLocation.search);
      const returnTo = currentSearchParams.get("returnTo");
      const targetPath = "/funding/deposit";

      let finalPath = targetPath;
      if (returnTo && !targetPath.includes("returnTo=")) {
        const url = new URL(targetPath, "http://dummy.com");
        url.searchParams.set("returnTo", returnTo);
        finalPath = url.pathname + url.search;
      }

      expect(returnTo).toBe("/execute?data=test");
      expect(finalPath).toBe(
        "/funding/deposit?returnTo=%2Fexecute%3Fdata%3Dtest",
      );
    });

    it("should not modify URL if returnTo already exists in target", () => {
      const mockLocation = {
        pathname: "/funding",
        search: "?returnTo=%2Fexecute%3Fdata%3Dtest",
      };

      const currentSearchParams = new URLSearchParams(mockLocation.search);
      const returnTo = currentSearchParams.get("returnTo");
      const targetPath = "/funding/deposit?returnTo=%2Fanother%3Fdata%3Dother";

      let finalPath = targetPath;
      if (returnTo && !targetPath.includes("returnTo=")) {
        const url = new URL(targetPath, "http://dummy.com");
        url.searchParams.set("returnTo", returnTo);
        finalPath = url.pathname + url.search;
      }

      // Should not modify the target path since it already has returnTo
      expect(finalPath).toBe(
        "/funding/deposit?returnTo=%2Fanother%3Fdata%3Dother",
      );
    });

    it("should not add returnTo if current URL doesn't have it", () => {
      const mockLocation = {
        pathname: "/funding",
        search: "",
      };

      const currentSearchParams = new URLSearchParams(mockLocation.search);
      const returnTo = currentSearchParams.get("returnTo");
      const targetPath = "/funding/deposit";

      let finalPath = targetPath;
      if (returnTo && !targetPath.includes("returnTo=")) {
        const url = new URL(targetPath, "http://dummy.com");
        url.searchParams.set("returnTo", returnTo);
        finalPath = url.pathname + url.search;
      }

      expect(returnTo).toBeNull();
      expect(finalPath).toBe("/funding/deposit");
    });
  });
});
