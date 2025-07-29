import { useCallback, useContext, useMemo, useState } from "react";
import { MarketplaceContext } from "@/context/marketplace";
import { useLocalSearchParams } from "expo-router";
import { cairo, getChecksumAddress } from "starknet";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { useEntrypoints } from "./entrypoints";
import { useAccount } from "./account";

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

  const account = useAccount();
  const address = account?.address || "";
  const { address: contractAddress, tokenId } = useLocalSearchParams();
  const contractAddressStr = contractAddress as string;
  const tokenIdStr = tokenId as string;
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
    return getCollectionOrders(contractAddressStr || "0x0");
  }, [getCollectionOrders, contractAddressStr]);

  const tokenOrders = useMemo(() => {
    const collection = getChecksumAddress(contractAddressStr || "0x0");
    const collectionOrders = orders[collection];
    if (!collectionOrders) return [];
    const token = BigInt(tokenIdStr || "0x0").toString();
    return Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
  }, [orders, tokenIdStr]);

  const selfOrders = useMemo(() => {
    if (!address) return [];
    return Object.values(tokenOrders).filter(
      (order) => BigInt(order.owner) === BigInt(address),
    );
  }, [address, tokenOrders]);

  const order: OrderModel | undefined = useMemo(() => {
    if (!contractAddressStr || !tokenIdStr) return;
    const collection = getChecksumAddress(contractAddressStr);
    const collectionOrders = orders[collection];
    if (!collectionOrders) return;
    const token = BigInt(tokenIdStr).toString();
    const tokenOrders = Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
    if (tokenOrders.length === 0) return;
    return tokenOrders[0];
  }, [orders, contractAddressStr, tokenIdStr]);

  const isListed = useMemo(() => {
    if (!address) return false;
    return Object.values(tokenOrders).some(
      (order) => BigInt(order.owner) === BigInt(address),
    );
  }, [address, tokenOrders]);

  const { entrypoints } = useEntrypoints({ address: contractAddressStr || "" });

  const { data: royalties, isFetching: isLoading } = useQuery({
    enabled: !!contractAddressStr && !!book && !!tokenIdStr && !!amount,
    queryKey: ["fee", contractAddressStr, tokenIdStr, amount],
    queryFn: async () => {
      if (!entrypoints || !entrypoints.includes(FEE_ENTRYPOINT)) return;
      try {
        return await controller?.provider?.callContract({
          contractAddress: contractAddressStr ?? "",
          entrypoint: FEE_ENTRYPOINT,
          calldata: [
            cairo.uint256(tokenIdStr ?? "0x0"),
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
