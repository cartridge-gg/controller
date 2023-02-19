import ControllerConnector from "@cartridge/connector";
import { useConnectors } from "@starknet-react/core";

const Quests = () => {
  const { available } = useConnectors()
  const cartridgeConnector = available[0] as ControllerConnector;
  const gameId = "influence";

  return (
    <>
      <button
        onClick={async () => {
          await cartridgeConnector.showQuests(gameId);
        }}
      >{gameId}</button>
    </>
  );
};

export default Quests;
