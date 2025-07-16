import { useCallback, useContext, useMemo, useState } from "react";
import { MarketplaceContext } from "@/context/marketplace";
import { useParams } from "react-router-dom";
import { cairo, getChecksumAddress } from "starknet";
import { useAccountProfile } from "@/hooks/account";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { useEntrypoints } from "./entrypoints";

const FEE_ENTRYPOINT = "royalty_info";

/**
 * Custom hook to access the Marketplace context and account information.
 * Must be used within a MarketplaceProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Marketplace provider instance
 * - orders: All the existing orders
 * @throws {Error} If used outside of a MarketplaceProvider context
 */
export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error(
      "The `useMarketplace` hook must be used within a `MarketplaceProvider`",
    );
  }

  const { address } = useAccountProfile({ overridable: true });
  const { address: contractAddress, tokenId } = useParams();
  const { controller } = useConnection();
  const {
    chainId,
    provider,
    orders,
    addOrder,
    removeOrder,
    listings,
    sales,
    book,
  } = context;
  const [amount, setAmount] = useState<number>(0);

  const getCollectionOrders = useCallback(
    (contractAddress: string) => {
      const collection = getChecksumAddress(contractAddress);
      const collectionOrders = orders[collection];
      if (!collectionOrders) return {};
      return Object.entries(collectionOrders).reduce(
        (acc, [token, orders]) => {
          const filtered = Object.values(orders).filter(
            (order) =>
              !!order &&
              order.status.value === StatusType.Placed &&
              BigInt(order.owner) === BigInt(address),
          );
          if (filtered.length === 0) return acc;
          acc[token] = filtered;
          return acc;
        },
        {} as { [token: string]: OrderModel[] },
      );
    },
    [orders, address],
  );

  const collectionOrders: { [token: string]: OrderModel[] } = useMemo(() => {
    return getCollectionOrders(contractAddress || "0x0");
  }, [getCollectionOrders, contractAddress]);

  const tokenOrders = useMemo(() => {
    const collection = getChecksumAddress(contractAddress || "0x0");
    const collectionOrders = orders[collection];
    if (!collectionOrders) return [];
    const token = BigInt(tokenId || "0x0").toString();
    return Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
  }, [orders, tokenId]);

  const selfOrders = useMemo(() => {
    if (!address) return [];
    return Object.values(tokenOrders).filter(
      (order) => BigInt(order.owner) === BigInt(address),
    );
  }, [address, tokenOrders]);

  const order: OrderModel | undefined = useMemo(() => {
    if (!contractAddress || !tokenId) return;
    const collection = getChecksumAddress(contractAddress);
    const collectionOrders = orders[collection];
    if (!collectionOrders) return;
    const token = BigInt(tokenId).toString();
    const tokenOrders = Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
    if (tokenOrders.length === 0) return;
    return tokenOrders[0];
  }, [orders, contractAddress, tokenId]);

  const isListed = useMemo(() => {
    if (!address) return false;
    return Object.values(tokenOrders).some(
      (order) => BigInt(order.owner) === BigInt(address),
    );
  }, [address, tokenOrders]);

  const { entrypoints } = useEntrypoints({ address: contractAddress || "" });

  const { data: royalties, isFetching: isLoading } = useQuery({
    enabled: !!contractAddress && !!book && !!tokenId && !!amount,
    queryKey: ["fee", contractAddress, tokenId, amount],
    queryFn: async () => {
      if (!entrypoints || !entrypoints.includes(FEE_ENTRYPOINT)) return;
      try {
        return await controller?.provider?.callContract({
          contractAddress: contractAddress ?? "",
          entrypoint: FEE_ENTRYPOINT,
          calldata: [
            cairo.uint256(tokenId ?? "0x0"),
            cairo.uint256(amount || 0),
          ],
        });
      } catch (error: unknown) {
        console.log(error);
      }
    },
  });

  const marketplaceFee = useMemo(() => {
    if (!book) return 0;
    return (book.fee_num * amount) / 10000;
  }, [book, amount]);

  const royaltyFee = useMemo(() => {
    if (!royalties) return 0;
    return royalties[1];
  }, [royalties]);

  return {
    chainId,
    provider,
    listings,
    sales,
    orders,
    marketplaceFee,
    royaltyFee,
    addOrder,
    removeOrder,
    setAmount,
    order,
    collectionOrders,
    tokenOrders,
    selfOrders,
    isListed,
    royalties,
    isLoading,
    getCollectionOrders,
  };
};
