import { afterEach, describe, expect, it, vi } from "vitest";
import Controller, { toStarknetFeeEstimate } from "./controller";

afterEach(() => {
  Controller.setSelfFundedGasMultiplier(undefined);
});

describe("toStarknetFeeEstimate", () => {
  it("returns a plain v10 fee payload with string fields and FRI units", () => {
    expect(
      toStarknetFeeEstimate({
        l1_gas_consumed: 100,
        l1_gas_price: 200,
        l2_gas_consumed: 300,
        l2_gas_price: 400,
        l1_data_gas_consumed: 500,
        l1_data_gas_price: 600,
        overall_fee: 800,
      }),
    ).toEqual({
      l1_gas_consumed: "100",
      l1_gas_price: "300",
      l2_gas_consumed: "300",
      l2_gas_price: "600",
      l1_data_gas_consumed: "500",
      l1_data_gas_price: "900",
      overall_fee: "1800",
      unit: "FRI",
    });
  });
});

describe("self-funded gas multiplier", () => {
  const controllerWithCartridge = () => {
    const cartridge = {
      execute: vi.fn().mockResolvedValue({ transaction_hash: "0x1" }),
      trySessionExecute: vi.fn().mockResolvedValue({ transaction_hash: "0x1" }),
      estimateInvokeFee: vi.fn(),
    };
    const controller = Object.create(Controller.prototype) as Controller;
    Object.assign(controller, { cartridge });
    return { controller, cartridge };
  };

  it("forwards the configured multiplier to self-funded execution", async () => {
    const { controller, cartridge } = controllerWithCartridge();
    Controller.setSelfFundedGasMultiplier(3);

    await controller.execute([]);

    expect(cartridge.execute).toHaveBeenCalledWith([], undefined, undefined, 3);
  });

  it("forwards the configured multiplier to session fallback execution", async () => {
    const { controller, cartridge } = controllerWithCartridge();
    Controller.setSelfFundedGasMultiplier(3);

    await controller.trySessionExecute("game", []);

    expect(cartridge.trySessionExecute).toHaveBeenCalledWith(
      "game",
      [],
      undefined,
      3,
    );
  });

  it("leaves the WASM default in effect when not configured", async () => {
    const { controller, cartridge } = controllerWithCartridge();

    await controller.trySessionExecute("game", []);

    expect(cartridge.trySessionExecute).toHaveBeenCalledWith(
      "game",
      [],
      undefined,
      undefined,
    );
  });

  it("keeps default execution on the sponsored route without a fee estimate", async () => {
    const { controller, cartridge } = controllerWithCartridge();

    await controller.execute([]);

    expect(cartridge.execute).toHaveBeenCalledWith(
      [],
      undefined,
      undefined,
      undefined,
    );
    expect(cartridge.estimateInvokeFee).not.toHaveBeenCalled();
  });

  it("passes confirmation price headroom to WASM exactly once", async () => {
    const { controller, cartridge } = controllerWithCartridge();
    const fee = toStarknetFeeEstimate({
      l1_gas_consumed: 10,
      l1_gas_price: 96966059925918,
      l2_gas_consumed: 20,
      l2_gas_price: 100,
      l1_data_gas_consumed: 30,
      l1_data_gas_price: 134488580849,
      overall_fee: 973695256686650,
    });

    await controller.execute([], fee);

    expect(cartridge.execute).toHaveBeenCalledWith(
      [],
      {
        l1_gas_consumed: 10,
        l1_gas_price: 145449089888877,
        l2_gas_consumed: 20,
        l2_gas_price: 150,
        l1_data_gas_consumed: 30,
        l1_data_gas_price: 201732871273,
        overall_fee: Number(fee.overall_fee),
      },
      undefined,
      undefined,
    );
  });

  it("leaves session estimation and buffering to WASM", async () => {
    const { controller, cartridge } = controllerWithCartridge();

    await controller.trySessionExecute("game", []);

    expect(cartridge.trySessionExecute).toHaveBeenCalledExactlyOnceWith(
      "game",
      [],
      undefined,
      undefined,
    );
    expect(cartridge.estimateInvokeFee).not.toHaveBeenCalled();
    expect(cartridge.execute).not.toHaveBeenCalled();
  });

  it("propagates session errors without retrying as an explicit user payment", async () => {
    const { controller, cartridge } = controllerWithCartridge();
    const error = new Error("rate limited");
    cartridge.trySessionExecute.mockRejectedValueOnce(error);

    await expect(controller.trySessionExecute("game", [])).rejects.toBe(error);

    expect(cartridge.trySessionExecute).toHaveBeenCalledTimes(1);
    expect(cartridge.estimateInvokeFee).not.toHaveBeenCalled();
    expect(cartridge.execute).not.toHaveBeenCalled();
  });
});
