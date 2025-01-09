import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ArcadeProvider as ExternalProvider,
  Registry,
  PinningEvent,
  setupWorld,
  sepolia as manifest,
} from "@bal7hazar/arcade-sdk";
import * as torii from "@dojoengine/torii-client";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const TORII_URL = "https://api.cartridge.gg/x/arcade/torii";

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  client: ReturnType<typeof setupWorld>;
  provider: ExternalProvider;
  torii: torii.ToriiClient | undefined;
  pins: { [playerId: string]: string[] };
}

/**
 * React context for sharing Arcade-related data throughout the application.
 */
export const ArcadeContext = createContext<ArcadeContextType | null>(null);

/**
 * Provider component that makes Arcade context available to child components.
 *
 * @param props.children - Child components that will have access to the Arcade context
 * @throws {Error} If ArcadeProvider is used more than once in the component tree
 */
export const ArcadeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const currentValue = useContext(ArcadeContext);
  const [pins, setPins] = useState<{ [playerId: string]: string[] }>({});
  const [toriiClient, setToriiClient] = useState<torii.ToriiClient>();

  if (currentValue) {
    throw new Error("ArcadeProvider can only be used once");
  }

  const provider = new ExternalProvider(manifest, RPC_URL);

  const setup = useCallback(async () => {
    const client = await provider.getToriiClient(RPC_URL, TORII_URL);
    setToriiClient(client);
  }, [provider, setToriiClient]);

  const handleEvents = useCallback((events: PinningEvent | PinningEvent[]) => {
    const data = Array.isArray(events) ? events : [events];
    data.forEach((event: PinningEvent) => {
      if (event.time == 0) {
        // Remove the achievement from the player's list
        setPins((prevPins) => {
          const achievementIds = prevPins[event.playerId] || [];
          return {
            ...prevPins,
            [event.playerId]: achievementIds.filter(
              (id: string) => id !== event.achievementId,
            ),
          };
        });
      } else {
        // Otherwise, add the achievement to the player's list
        setPins((prevPins) => {
          const achievementIds = prevPins[event.playerId] || [];
          return {
            ...prevPins,
            [event.playerId]: [...achievementIds, event.achievementId],
          };
        });
      }
    });
  }, []);

  useEffect(() => {
    setup();
  }, [setup]);

  useEffect(() => {
    if (!toriiClient) return;
    Registry.init(toriiClient);
    if (!!Registry.Pinning.unsubscribe) return;
    Registry.Pinning.fetch(handleEvents);
    Registry.Pinning.sub(handleEvents);
    return () => {
      Registry.Pinning.unsub();
    };
  }, [toriiClient, handleEvents]);

  return (
    <ArcadeContext.Provider
      value={{
        client: setupWorld(provider),
        provider,
        torii: toriiClient,
        pins,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
