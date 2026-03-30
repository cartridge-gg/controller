import { test, expect } from "@playwright/test";
import { ec, stark, encode } from "starknet";

const STRK_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// A valid StarkNet address to use as the controller address in test sessions.
const TEST_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000001234";
const TEST_OWNER_GUID =
  "0x0000000000000000000000000000000000000000000000000000000000005678";

function generateTestSigner() {
  const privKey = stark.randomAddress();
  const pubKey = ec.starkCurve.getStarkKey(privKey);
  return { privKey, pubKey };
}

function buildAuthorizedPolicies() {
  return {
    verified: false,
    contracts: {
      [STRK_CONTRACT_ADDRESS]: {
        methods: [
          { name: "transfer", entrypoint: "transfer", authorized: true },
        ],
      },
    },
  };
}

function buildSessionPayload({
  expiresAt,
  address = TEST_ADDRESS,
  ownerGuid = TEST_OWNER_GUID,
  username = "test-user",
}: {
  expiresAt: number;
  address?: string;
  ownerGuid?: string;
  username?: string;
}) {
  return {
    username,
    address,
    ownerGuid,
    expiresAt: String(expiresAt),
    guardianKeyGuid: "0x0",
    metadataHash: "0x0",
  };
}

function encodeSession(payload: object): string {
  return btoa(JSON.stringify(payload)).replace(/=+$/, "");
}

test.describe("Session redirect ingestion", () => {
  test("valid session from redirect is ingested and account is created", async ({
    page,
  }) => {
    const signer = generateTestSigner();
    const policies = buildAuthorizedPolicies();
    const futureExpiry = Math.floor(Date.now() / 1000) + 86400; // 24h from now
    const session = buildSessionPayload({ expiresAt: futureExpiry });
    const encoded = encodeSession(session);

    // Pre-seed localStorage before the page loads so SessionProvider finds
    // the signer and policies during construction.
    await page.addInitScript(
      ({ signer, policies }) => {
        localStorage.setItem("sessionSigner", JSON.stringify(signer));
        localStorage.setItem("sessionPolicies", JSON.stringify(policies));
      },
      { signer, policies },
    );

    // Navigate with the startapp query parameter — this is the redirect URL
    // the keychain would send the user back to after session registration.
    await page.goto(`/?startapp=${encoded}`);

    // SessionProvider.probe() is called on page load (main.ts line 279).
    // It calls tryRetrieveSessionAccount() which detects startapp in the URL,
    // calls ingestSessionFromRedirect(), stores in localStorage, and creates
    // a SessionAccount. The status div is then updated.
    await expect(page.locator("#status")).toContainText(
      "Session ready. Address:",
      { timeout: 15000 },
    );
    await expect(page.locator("#execute")).toBeEnabled();
  });

  test("expired session from redirect is rejected", async ({ page }) => {
    const signer = generateTestSigner();
    const policies = buildAuthorizedPolicies();
    const pastExpiry = Math.floor(Date.now() / 1000) - 3600; // 1h ago
    const session = buildSessionPayload({ expiresAt: pastExpiry });
    const encoded = encodeSession(session);

    await page.addInitScript(
      ({ signer, policies }) => {
        localStorage.setItem("sessionSigner", JSON.stringify(signer));
        localStorage.setItem("sessionPolicies", JSON.stringify(policies));
      },
      { signer, policies },
    );

    await page.goto(`/?startapp=${encoded}`);

    // With an expired session, tryRetrieveSessionAccount() should clear the
    // stored session and NOT create a SessionAccount.
    // The status should NOT show "Session ready".
    // Wait a moment for any async operations to settle.
    await page.waitForTimeout(3000);
    await expect(page.locator("#status")).not.toContainText(
      "Session ready. Address:",
    );
    await expect(page.locator("#execute")).toBeDisabled();
  });

  test("malformed session payload is handled gracefully", async ({ page }) => {
    const signer = generateTestSigner();
    const policies = buildAuthorizedPolicies();

    await page.addInitScript(
      ({ signer, policies }) => {
        localStorage.setItem("sessionSigner", JSON.stringify(signer));
        localStorage.setItem("sessionPolicies", JSON.stringify(policies));
      },
      { signer, policies },
    );

    // Navigate with invalid base64 payload
    await page.goto("/?startapp=not-valid-json-payload");

    await page.waitForTimeout(3000);
    await expect(page.locator("#status")).not.toContainText(
      "Session ready. Address:",
    );
    await expect(page.locator("#execute")).toBeDisabled();
  });
});
