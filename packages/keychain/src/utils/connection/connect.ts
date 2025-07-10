import { AuthOptions, ConnectReply } from "@cartridge/controller";
import { Policies } from "@cartridge/presets";
import { ConnectCtx, ConnectionCtx } from "./types";

export function connect({
  setRpcUrl,
  setContext,
  setConfigSignupOptions,
}: {
  setRpcUrl: (url: string) => void;
  setContext: (context: ConnectionCtx | undefined) => void;
  setConfigSignupOptions: (options: AuthOptions | undefined) => void;
}) {
  return (origin: string) => {
    return (
      policies: Policies,
      rpcUrl: string,
      signupOptions?: AuthOptions,
    ): Promise<ConnectReply> => {
      setRpcUrl(rpcUrl);

      if (signupOptions && signupOptions.length === 0) {
        throw new Error("If defined, signup options cannot be empty");
      }

      setConfigSignupOptions(signupOptions);

      return new Promise((resolve, reject) => {
        setContext({
          type: "connect",
          origin,
          policies,
          resolve,
          reject,
        } as ConnectCtx);
      }).finally(() => {
        setContext(undefined);
      }) as Promise<ConnectReply>;
    };
  };
}
