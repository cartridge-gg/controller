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
  BookModel,
  OrderModel,
  ListingEvent,
  SaleEvent,
  MarketplaceModel,
  CategoryType,
  StatusType,
  Marketplace,
  MarketplaceOptions,
} from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";
import { ArcadeContext } from "@/context/arcade";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

/**
 * Provider component that makes Arcade context available to child components.
 *
 * @param props.children - Child components that will have access to the Arcade context
 * @throws {Error} If ArcadeProvider is used more than once in the component tree
 */
export const ArcadeProvider = ({ children }: { children: ReactNode }) => {
  const currentValue = useContext(ArcadeContext);
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
  const [initializable, setInitializable] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  if (currentValue) {
    throw new Error("ArcadeProvider can only be used once");
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

  // TODO: The real fix belongs upstream in the @cartridge/arcade fetcher.
  // `Marketplace.fetch` fetches and parses ALL entities (~14k) in a single
  // query and hands them to this callback in one call, so the network/decode/
  // parse cost is already paid synchronously before we get here — the chunking
  // below only spreads the React state-update half. Add cursor-based pagination
  // (withLimit + withCursor) to the arcade fetcher so it streams pages to this
  // callback; then this handler can drop the manual chunking entirely.
  const handleMarketplaceEntities = useCallback(
    async (entities: MarketplaceModel[]) => {
      const now = Date.now();
      const CHUNK_SIZE = 250;

      // Process the batch in chunks, yielding to the browser between each so a
      // large initial fetch doesn't lock up the main thread. Within a chunk we
      // accumulate locally and flush a single state update per type, instead of
      // one (full-object-spreading) setState per entity.
      for (let i = 0; i < entities.length; i += CHUNK_SIZE) {
        const chunk = entities.slice(i, i + CHUNK_SIZE);

        let nextBook: BookModel | null = null;
        const orderOps: { type: "add" | "remove"; order: OrderModel }[] = [];
        const saleEvents: SaleEvent[] = [];
        const listingEvents: ListingEvent[] = [];

        for (const entity of chunk) {
          if (BookModel.isType(entity as BookModel)) {
            const book = entity as BookModel;
            if (book.version === 0) continue;
            nextBook = book;
          } else if (OrderModel.isType(entity as OrderModel)) {
            const order = entity as OrderModel;
            if (order.expiration * 1000 < now) continue;
            if (order.category.value !== CategoryType.Sell) continue;
            orderOps.push({
              type: order.status.value === StatusType.Placed ? "add" : "remove",
              order,
            });
          } else if (SaleEvent.isType(entity as SaleEvent)) {
            saleEvents.push(entity as SaleEvent);
          } else if (ListingEvent.isType(entity as ListingEvent)) {
            listingEvents.push(entity as ListingEvent);
          }
        }

        if (nextBook) setBook(nextBook);

        if (orderOps.length) {
          setOrders((prev) => {
            const next = { ...prev };
            for (const { type, order } of orderOps) {
              const collection = getChecksumAddress(order.collection);
              const token = order.tokenId.toString();
              if (type === "add") {
                next[collection] = {
                  ...(next[collection] || {}),
                  [token]: {
                    ...(next[collection]?.[token] || {}),
                    [order.id]: order,
                  },
                };
              } else if (next[collection]?.[token]?.[order.id]) {
                next[collection] = {
                  ...next[collection],
                  [token]: { ...next[collection][token] },
                };
                delete next[collection][token][order.id];
              }
            }
            return next;
          });
        }

        if (saleEvents.length) {
          setSales((prev) => {
            const next = { ...prev };
            for (const sale of saleEvents) {
              const order = sale.order;
              const collection = getChecksumAddress(order.collection);
              const token = order.tokenId.toString();
              next[collection] = {
                ...(next[collection] || {}),
                [token]: {
                  ...(next[collection]?.[token] || {}),
                  [order.id]: sale,
                },
              };
            }
            return next;
          });
        }

        if (listingEvents.length) {
          setListings((prev) => {
            const next = { ...prev };
            for (const listing of listingEvents) {
              const order = listing.order;
              const collection = getChecksumAddress(order.collection);
              const token = order.tokenId.toString();
              next[collection] = {
                ...(next[collection] || {}),
                [token]: {
                  ...(next[collection]?.[token] || {}),
                  [order.id]: listing,
                },
              };
            }
            return next;
          });
        }

        // Yield to the event loop between chunks so the UI stays responsive.
        if (i + CHUNK_SIZE < entities.length) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }
    },
    [setBook, setOrders, setListings, setSales],
  );

  useEffect(() => {
    if (initialized || !initializable) return;
    const initialize = async () => {
      await Marketplace.init(CHAIN_ID);
      setInitialized(true);
    };
    initialize();
  }, [initialized, initializable, setInitialized]);

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

  const marketplaceAddress = useMemo<string | undefined>(() => {
    return provider?.manifest.contracts.find((c: { tag: string }) =>
      c.tag?.includes("Marketplace"),
    )?.address as string;
  }, [provider?.manifest.contracts]);

  return (
    <ArcadeContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider,
        book,
        orders,
        listings,
        sales,
        addOrder,
        removeOrder,
        initializable,
        setInitializable,
        marketplaceAddress,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
