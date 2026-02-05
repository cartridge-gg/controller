import type {
  JsRevokableSession,
  Owner,
} from "@cartridge/controller-wasm/controller";
import Controller, { allUseSameAuth } from "./controller";
import { createMockController } from "@/test/mocks/mock-controller";

export default class ControllerE2E extends Controller {
  static async apiLogin({
    classHash,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }): Promise<Controller> {
    return createMockController({
      classHash,
      rpcUrl,
      address,
      username,
      owner,
    }) as unknown as Controller;
  }

  static async create({
    classHash,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }): Promise<Controller> {
    return createMockController({
      classHash,
      rpcUrl,
      address,
      username,
      owner,
    }) as unknown as Controller;
  }

  static async login({
    classHash,
    rpcUrl,
    address,
    username,
    owner,
    session_expires_at_s,
  }: {
    appId: string;
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
    cartridgeApiUrl: string;
    session_expires_at_s: number;
    isControllerRegistered: boolean;
  }): Promise<{
    controller: Controller;
    session: JsRevokableSession;
  }> {
    return {
      controller: createMockController({
        classHash,
        rpcUrl,
        address,
        username,
        owner,
      }) as unknown as Controller,
      session: {
        expiresAt: BigInt(session_expires_at_s),
        guardianKeyGuid: "mock-guardian-guid",
        metadataHash: "0x0",
        sessionKeyGuid: "mock-session-guid",
        allowedPoliciesRoot: "0x0",
        authorization: [],
      } as JsRevokableSession,
    };
  }

  static async fromStore(): Promise<Controller | undefined> {
    return undefined;
  }
}

export { allUseSameAuth };
