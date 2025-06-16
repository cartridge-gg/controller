import { useContext, useMemo } from "react";
import { MarketplaceContext } from "#context/marketplace";
import { useParams } from "react-router-dom";
import { getChecksumAddress } from "starknet";
import { useAccount } from "./account";
import { OrderModel, StatusType } from "@cartridge/marketplace";

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

  const { address } = useAccount();
  const { address: contractAddress, tokenId } = useParams();
  const { chainId, provider, orders, listings, sales } = context;

  const collectionOrders: { [token: string]: OrderModel[] } = useMemo(() => {
    const collection = getChecksumAddress(contractAddress || "0x0");
    const collectionOrders = orders[collection];
    if (!collectionOrders) return {};
    return Object.entries(collectionOrders).reduce(
      (acc, [token, orders]) => {
        acc[token] = Object.values(orders).filter(
          (order) => order.status.value === StatusType.Placed,
        );
        return acc;
      },
      {} as { [token: string]: OrderModel[] },
    );
  }, [orders, contractAddress]);

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

  return {
    chainId,
    provider,
    listings,
    sales,
    orders,
    order,
    collectionOrders,
    tokenOrders,
    selfOrders,
    isListed,
  };
};
