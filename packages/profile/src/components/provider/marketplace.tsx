import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MarketplaceProvider as ExternalProvider,
  MarketplaceModel,
  Marketplace,
  OrderModel,
  MarketplaceOptions,
} from "@cartridge/marketplace";
import { constants, getChecksumAddress } from "starknet";
import { MarketplaceContext } from "#context/marketplace";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

/**
 * Provider component that makes Marketplace context available to child components.
 *
 * @param props.children - Child components that will have access to the Marketplace context
 * @throws {Error} If MarketplaceProvider is used more than once in the component tree
 */
export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const currentValue = useContext(MarketplaceContext);
  const [orders, setOrders] = useState<{
    [collection: string]: { [token: string]: OrderModel[] };
  }>({});
  const [initialized, setInitialized] = useState<boolean>(false);

  if (currentValue) {
    throw new Error("MarketplaceProvider can only be used once");
  }

  const provider = useMemo(
    // TODO: Update here to select either Mainnet or Sepolia
    () => new ExternalProvider(CHAIN_ID),
    [],
  );

  const handleMarketplaceModels = useCallback((models: MarketplaceModel[]) => {
    models.forEach((model: MarketplaceModel) => {
      if (OrderModel.isType(model as OrderModel)) {
        const order = model as OrderModel;
        const collection = getChecksumAddress(order.collection);
        const token = order.tokenId.toString();
        setOrders((prev) => ({
          ...prev,
          [collection]: {
            ...(prev[collection] || {}),
            [token]: [...(prev[collection]?.[token] || []), order],
          },
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (initialized) return;
    const initialize = async () => {
      await Marketplace.init(CHAIN_ID);
      setInitialized(true);
    };
    initialize();
  }, [initialized, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
    const options: MarketplaceOptions = { order: true };
    Marketplace.fetch(handleMarketplaceModels, options);
    Marketplace.sub(handleMarketplaceModels, options);
    return () => {
      Marketplace.unsub();
    };
  }, [initialized, handleMarketplaceModels]);

  return (
    <MarketplaceContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider,
        orders,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};
