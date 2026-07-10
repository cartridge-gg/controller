import { describe, expect, it } from "vitest";
import { exportKey, importKey } from "./snapshotCrypto";

describe("snapshotCrypto importKey", () => {
  it("copies ArrayBufferLike-backed key bytes before importing", async () => {
    const backing = new SharedArrayBuffer(32);
    const keyBytes = new Uint8Array(backing);
    keyBytes.set(Array.from({ length: 32 }, (_, index) => index));

    const key = await importKey(keyBytes);

    expect(await exportKey(key)).toEqual(Uint8Array.from(keyBytes));
  });
});
