import type {
  JsCall,
  JsFelt,
  JsRegisterResponse,
  Owner,
} from "@cartridge/controller-wasm/controller";
import { constants, type Provider } from "starknet";

export type MockController = {
  provider: Provider;
  address: () => string;
  username: () => string;
  rpcUrl: () => string;
  chainId: () => string;
  owner: () => Owner;
  classHash: () => string;
  ownerGuid: () => string;
  createSession: () => Promise<void>;
  register: () => Promise<JsRegisterResponse>;
  upgrade: (newClassHash: JsFelt) => Promise<JsCall>;
  disconnect: () => Promise<void>;
};

export const createMockController = ({
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
}): MockController => {
  const mockProvider = {
    getClassHashAt: async () => classHash,
    waitForTransaction: async () => ({ status: "ACCEPTED_ON_L2" }),
    callContract: async () => ({ result: ["0x0"] }),
    call: async () => ({ result: ["0x0"] }),
    getEvents: async () => ({ events: [] }),
    getAddressFromStarkName: async () => "0x0",
  } as unknown as Provider;

  const controller: MockController = {
    provider: mockProvider,
    address: () => address,
    username: () => username,
    rpcUrl: () => rpcUrl,
    chainId: () => constants.StarknetChainId.SN_SEPOLIA,
    owner: () => owner,
    classHash: () => classHash,
    ownerGuid: () => "mock-owner-guid",
    createSession: async () => undefined,
    register: async () =>
      ({
        register: {
          username,
        },
      }) as JsRegisterResponse,
    upgrade: async (newClassHash: JsFelt) =>
      ({
        contractAddress: address,
        entrypoint: "upgrade",
        calldata: [newClassHash],
      }) as JsCall,
    disconnect: async () => {
      delete window.controller;
    },
  };

  return controller;
};
