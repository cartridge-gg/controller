import { useState } from "react";
import { BigNumberish } from "starknet";

export interface OrderModel {
  id: BigNumberish;
  price: BigNumberish;
  currency: string;
  expiration: BigNumberish;
  tokenId: BigNumberish;
  collection: string;
  owner: string;
}

export function useMarketplace() {
  const [amount, setAmount] = useState<number>(0);

  // TODO: Implement marketplace functionality if needed
  const isListed = false;
  const provider = null;
  const selfOrders: OrderModel[] = [];
  const order: OrderModel | undefined = undefined;
  const orders = {};
  const marketplaceFee = 0;
  const royaltyFee = 0;
  const sales: { [key: string]: { [key: string]: any[] } } = {};
  const listings: { [key: string]: { [key: string]: any[] } } = {};
  const collectionOrders = {};

  const removeOrder = (_: OrderModel) => {
    // TODO: Implement
  };

  const addOrder = (_: OrderModel) => {
    // TODO: Implement
  };

  const getCollectionOrders = (_: string) => {
    // TODO: Implement
    return {};
  };

  return {
    isListed,
    provider,
    selfOrders,
    order,
    orders,
    marketplaceFee,
    royaltyFee,
    sales,
    listings,
    collectionOrders,
    removeOrder,
    addOrder,
    getCollectionOrders,
    amount,
    setAmount,
  };
}
