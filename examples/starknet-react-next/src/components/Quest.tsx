import ControllerConnector from "@cartridge/connector";
import { useConnect } from "@starknet-react/core";

const Quests = () => {
  const { connectors } = useConnect();
  const cartridgeConnector = connectors[0] as unknown as ControllerConnector;
  const gameId = "influence";

  return (
    <>
      <button
        onClick={async () => {
          await cartridgeConnector.showQuests(gameId);
        }}
      >
        {gameId}
      </button>
    </>
  );
};

export default Quests;
