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
  GameModel,
  sepolia as manifest,
} from "@bal7hazar/arcade-sdk";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  provider: ExternalProvider;
  pins: { [playerId: string]: string[] };
  games: { [gameId: string]: GameModel };
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
export const ArcadeProvider = ({ children }: { children: ReactNode }) => {
  const currentValue = useContext(ArcadeContext);
  const [pins, setPins] = useState<{ [playerId: string]: string[] }>({});
  const [games, setGames] = useState<{ [gameId: string]: GameModel }>({});
  const [initialized, setInitialized] = useState<boolean>(false);

  if (currentValue) {
    throw new Error("ArcadeProvider can only be used once");
  }

  const provider = new ExternalProvider(manifest, RPC_URL);

  const handlePinningEvents = useCallback(
    (events: PinningEvent | PinningEvent[]) => {
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
    },
    [],
  );

  const handleGameModels = useCallback((models: GameModel | GameModel[]) => {
    const data = Array.isArray(models) ? models : [models];
    data.forEach((model: GameModel) => {
      setGames((prevGames) => ({
        ...prevGames,
        [`${model.worldAddress}-${model.namespace}`]: model,
      }));
    });
  }, []);

  useEffect(() => {
    if (initialized) return;
    const initialize = async () => {
      await Registry.init();
      setInitialized(true);
    };
    initialize();
  }, [initialized, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
    Registry.Pinning.fetch(handlePinningEvents);
    Registry.Pinning.sub(handlePinningEvents);
    return () => {
      Registry.Pinning.unsub();
    };
  }, [initialized, handlePinningEvents]);

  useEffect(() => {
    if (!initialized) return;
    Registry.Game.fetch(handleGameModels);
    Registry.Game.sub(handleGameModels);
    return () => {
      Registry.Game.unsub();
    };
  }, [initialized, handleGameModels]);

  return (
    <ArcadeContext.Provider
      value={{
        provider,
        pins,
        games,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
