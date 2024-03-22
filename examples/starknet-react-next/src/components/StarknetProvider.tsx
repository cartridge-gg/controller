import { goerli } from "@starknet-react/chains";
import { Connector, StarknetConfig } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import CartridgeConnector from "@cartridge/connector";
import { RpcProvider } from "starknet";

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[goerli]}
      connectors={connectors}
      provider={(_chain) =>
        new RpcProvider({
          nodeUrl: process.env.NEXT_PUBLIC_RPC_GOERLI,
        })
      }
    >
      {children}
    </StarknetConfig>
  );
}

// const url =
//   process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
//     ? `https://keychain-git-${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}.preview.cartridge.gg`
//         .replace("(", "")
//         .replace(")/", "-") // e.g. `feat(keychain)/branch-name` -> `featkeychain-branch-name`
//     : process.env.XFRAME_URL;
const url =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? "https://keychain-git-jun-int-509-upgrade-starknetjs-to-v6.preview.cartridge.gg/"
    : process.env.XFRAME_URL;
const connectors = [
  new CartridgeConnector([{ target: "0xdeadbeef", method: "testMethod" }], {
    url,
  }) as never as Connector,
];
