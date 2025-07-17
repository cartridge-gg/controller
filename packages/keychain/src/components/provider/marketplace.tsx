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
  CategoryType,
  ListingEvent,
  SaleEvent,
  StatusType,
  BookModel,
} from "@cartridge/marketplace";
import { constants, getChecksumAddress } from "starknet";
import { MarketplaceContext } from "@/context/marketplace";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

/**
 * Provider component that makes Marketplace context available to child components.
 *
 * @param props.children - Child components that will have access to the Marketplace context
 * @throws {Error} If MarketplaceProvider is used more than once in the component tree
 */
export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const currentValue = useContext(MarketplaceContext);
  const [book, setBook] = useState<BookModel | null>(null);
  const [orders, setOrders] = useState<{
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  }>({});
  const [listings, setListings] = useState<{
    [collection: string]: {
      [token: string]: { [listing: string]: ListingEvent };
    };
  }>({});
  const [sales, setSales] = useState<{
    [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
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

  const removeOrder = useCallback(
    (order: OrderModel) => {
      const collection = getChecksumAddress(order.collection);
      const token = order.tokenId.toString();
      setOrders((prev) => {
        const newOrders = { ...prev };
        if (newOrders[collection]?.[token]?.[order.id]) {
          delete newOrders[collection][token][order.id];
        }
        return newOrders;
      });
    },
    [setOrders],
  );

  const addOrder = useCallback(
    (order: OrderModel) => {
      const collection = getChecksumAddress(order.collection);
      const token = order.tokenId.toString();
      setOrders((prev) => ({
        ...prev,
        [collection]: {
          ...(prev[collection] || {}),
          [token]: {
            ...(prev[collection]?.[token] || {}),
            [order.id]: order,
          },
        },
      }));
    },
    [setOrders],
  );

  const handleMarketplaceEntities = useCallback(
    (entities: MarketplaceModel[]) => {
      const now = Date.now();
      entities.forEach((entity: MarketplaceModel) => {
        if (BookModel.isType(entity as BookModel)) {
          const book = entity as BookModel;
          if (book.version === 0) return;
          setBook(book);
        } else if (OrderModel.isType(entity as OrderModel)) {
          const order = entity as OrderModel;
          if (order.expiration * 1000 < now) return;
          if (order.category.value !== CategoryType.Sell) return;
          if (order.status.value === StatusType.Placed) {
            addOrder(order);
          } else {
            removeOrder(order);
          }
        } else if (SaleEvent.isType(entity as SaleEvent)) {
          const sale = entity as SaleEvent;
          const order = sale.order;
          const collection = getChecksumAddress(order.collection);
          const token = order.tokenId.toString();
          setSales((prev) => ({
            ...prev,
            [collection]: {
              ...(prev[collection] || {}),
              [token]: {
                ...(prev[collection]?.[token] || {}),
                [order.id]: sale,
              },
            },
          }));
        } else if (ListingEvent.isType(entity as ListingEvent)) {
          const listing = entity as ListingEvent;
          const order = listing.order;
          const collection = getChecksumAddress(order.collection);
          const token = order.tokenId.toString();
          setListings((prev) => ({
            ...prev,
            [collection]: {
              ...(prev[collection] || {}),
              [token]: {
                ...(prev[collection]?.[token] || {}),
                [order.id]: listing,
              },
            },
          }));
        }
      });
    },
    [addOrder, removeOrder, setBook, setListings, setSales],
  );

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
    const options: MarketplaceOptions = {
      book: true,
      order: true,
      sale: true,
      listing: true,
    };
    Marketplace.fetch(handleMarketplaceEntities, options);
    Marketplace.sub(handleMarketplaceEntities, options);
    return () => {
      Marketplace.unsub();
    };
  }, [initialized, handleMarketplaceEntities]);

  return (
    <MarketplaceContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider,
        book,
        orders,
        listings,
        sales,
        addOrder,
        removeOrder,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};
