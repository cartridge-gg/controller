import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArcadeProvider as ExternalProvider,
  Registry,
  Social,
  GameModel,
  PinEvent,
} from "@bal7hazar/arcade-sdk";
import { constants } from "starknet";

const CHAIN_ID = constants.StarknetChainId.SN_SEPOLIA;

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  chainId: string;
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

  const provider = useMemo(
    // TODO: Update here to select either Mainnet or Sepolia
    () => new ExternalProvider(CHAIN_ID),
    [],
  );

  const handlePinEvents = useCallback((events: PinEvent | PinEvent[]) => {
    const data = Array.isArray(events) ? events : [events];
    data.forEach((event: PinEvent) => {
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
      await Social.init(CHAIN_ID);
      setInitialized(true);
    };
    initialize();
  }, [initialized, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
    Social.Pin.fetch(handlePinEvents);
    Social.Pin.sub(handlePinEvents);
    return () => {
      Social.Pin.unsub();
    };
  }, [initialized, handlePinEvents]);

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
        chainId: CHAIN_ID,
        provider,
        pins,
        games,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
