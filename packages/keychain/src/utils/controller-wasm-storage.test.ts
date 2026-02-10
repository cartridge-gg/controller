import { clearControllerWasmStorage } from "./controller-wasm-storage";

describe("clearControllerWasmStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes controller-wasm keys and keeps unrelated keys", () => {
    localStorage.setItem("@cartridge/features", "keep-me");
    localStorage.setItem("@cartridge/active", "0xabc");
    localStorage.setItem("@cartridge/account/0x123", "account");
    localStorage.setItem("@cartridge/session/0x123", "session");
    localStorage.setItem("@cartridge/policies/0x123", "policies");
    localStorage.setItem("@cartridge/multi_chain/config", "config");
    localStorage.setItem("some-other-key", "keep-me-too");

    clearControllerWasmStorage(localStorage);

    expect(localStorage.getItem("@cartridge/features")).toBe("keep-me");
    expect(localStorage.getItem("some-other-key")).toBe("keep-me-too");

    expect(localStorage.getItem("@cartridge/active")).toBeNull();
    expect(localStorage.getItem("@cartridge/account/0x123")).toBeNull();
    expect(localStorage.getItem("@cartridge/session/0x123")).toBeNull();
    expect(localStorage.getItem("@cartridge/policies/0x123")).toBeNull();
    expect(localStorage.getItem("@cartridge/multi_chain/config")).toBeNull();
  });

  it("is a no-op when storage is undefined", () => {
    localStorage.setItem("@cartridge/active", "0xabc");
    clearControllerWasmStorage(undefined);
    expect(localStorage.getItem("@cartridge/active")).toBe("0xabc");
  });
});
