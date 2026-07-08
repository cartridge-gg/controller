import ControllerProvider from "../controller";

describe("ControllerProvider.credits", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns the credits balance from the keychain", async () => {
    const controller = new ControllerProvider({});
    const keychainCredits = jest.fn().mockResolvedValue(1234);
    (controller as any).keychain = {
      credits: keychainCredits,
    };

    await expect(controller.credits()).resolves.toBe(1234);
    expect(keychainCredits).toHaveBeenCalledTimes(1);
  });

  test("returns undefined and logs when keychain is not ready", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const controller = new ControllerProvider({});

    expect(controller.credits()).toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
  });

  test("propagates keychain errors", async () => {
    const controller = new ControllerProvider({});
    (controller as any).keychain = {
      credits: jest.fn().mockRejectedValue(new Error("NOT_CONNECTED")),
    };

    await expect(controller.credits()).rejects.toThrow("NOT_CONNECTED");
  });
});
