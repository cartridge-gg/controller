import { vi } from "vitest";

export class ToriiClient {
  constructor() {}

  async getEntities() {
    return { items: [] };
  }

  async getEventMessages() {
    return { items: [] };
  }

  async onEntityUpdated() {
    return { cancel: vi.fn() };
  }

  async onEventMessageUpdated() {
    return { cancel: vi.fn() };
  }
}

export type Subscription = {
  cancel: () => void;
};

export type Entity = Record<string, unknown>;
