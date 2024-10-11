import { Policy } from "@cartridge/controller";
import SessionConnector from "./session";
import { cloudStorage, openLink } from "@telegram-apps/sdk";

export default class TelegramConnector extends SessionConnector {
  constructor({
    rpcUrl,
    chainId,
    policies,
    redirectUrl,
  }: {
    rpcUrl: string;
    chainId: string;
    policies: Policy[];
    redirectUrl: string;
  }) {
    super({ rpcUrl, chainId, policies, redirectUrl, backend: {
        get: cloudStorage.getItem,
        set: cloudStorage.setItem,
        delete: cloudStorage.deleteItem,
        openLink: openLink,
      },
    });
  }
}
