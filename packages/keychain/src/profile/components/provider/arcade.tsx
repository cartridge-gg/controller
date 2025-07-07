import {
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
  PinEvent,
  GameModel,
  RegistryModel,
  SocialModel,
  SocialOptions,
  RegistryOptions,
  FollowEvent,
  EditionModel,
} from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";
import { ArcadeContext } from "#profile/context/arcade";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

/**
 * Provider component that makes Arcade context available to child components.
 *
 * @param props.children - Child components that will have access to the Arcade context
 * @throws {Error} If ArcadeProvider is used more than once in the component tree
 */
export const ArcadeProvider = ({ children }: { children: ReactNode }) => {
  const currentValue = useContext(ArcadeContext);
  const [pins, setPins] = useState<{ [playerId: string]: string[] }>({});
  const [followers, setFollowers] = useState<{ [playerId: string]: string[] }>(
    {},
  );
  const [followeds, setFolloweds] = useState<{ [playerId: string]: string[] }>(
    {},
  );
  const [games, setGames] = useState<{ [gameId: string]: GameModel }>({});
  const [editions, setEditions] = useState<{
    [editionId: string]: EditionModel;
  }>({});
  const [initialized, setInitialized] = useState<boolean>(false);

  if (currentValue) {
    throw new Error("ArcadeProvider can only be used once");
  }

  const provider = useMemo(
    // TODO: Update here to select either Mainnet or Sepolia
    () => new ExternalProvider(CHAIN_ID),
    [],
  );

  const handleSocialEvents = useCallback((models: SocialModel[]) => {
    models.forEach((model: SocialModel) => {
      // Return if the model is not a PinEvent
      if (PinEvent.isType(model as PinEvent)) {
        const event = model as PinEvent;
        // Return if the event is not a PinEvent
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
      } else if (FollowEvent.isType(model as FollowEvent)) {
        const event = model as FollowEvent;
        const follower = getChecksumAddress(event.follower);
        const followed = getChecksumAddress(event.followed);
        if (event.time == 0) {
          setFollowers((prevFollowers) => ({
            ...prevFollowers,
            [followed]: (prevFollowers[followed] || []).filter(
              (id: string) => id !== follower,
            ),
          }));
          setFolloweds((prevFolloweds) => ({
            ...prevFolloweds,
            [follower]: (prevFolloweds[follower] || []).filter(
              (id: string) => id !== followed,
            ),
          }));
        } else {
          setFollowers((prevFollowers) => ({
            ...prevFollowers,
            [followed]: [...(prevFollowers[followed] || []), follower],
          }));
          setFolloweds((prevFolloweds) => ({
            ...prevFolloweds,
            [follower]: [...(prevFolloweds[follower] || []), followed],
          }));
        }
      }
    });
  }, []);

  const handleRegistryModels = useCallback((models: RegistryModel[]) => {
    models.forEach((model: RegistryModel) => {
      if (GameModel.isType(model as GameModel)) {
        const game = model as GameModel;
        setGames((prevGames) => ({
          ...prevGames,
          [game.identifier]: game,
        }));
      } else if (EditionModel.isType(model as EditionModel)) {
        const edition = model as EditionModel;
        setEditions((prevEditions) => ({
          ...prevEditions,
          [edition.identifier]: edition,
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (initialized) return;
    const initialize = async () => {
      await Social.init(CHAIN_ID);
      await Registry.init(CHAIN_ID);
      setInitialized(true);
    };
    initialize();
  }, [initialized, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
    const options: SocialOptions = { pin: true, follow: true };
    Social.fetch(handleSocialEvents, options);
    Social.sub(handleSocialEvents, options);
    return () => {
      Social.unsub();
    };
  }, [initialized, handleSocialEvents]);

  useEffect(() => {
    if (!initialized) return;
    const options: RegistryOptions = { game: true, edition: true };
    Registry.fetch(handleRegistryModels, options);
    Registry.sub(handleRegistryModels, options);
    return () => {
      Registry.unsub();
    };
  }, [initialized, handleRegistryModels]);

  return (
    <ArcadeContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider,
        pins,
        followers,
        followeds,
        games,
        editions,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
