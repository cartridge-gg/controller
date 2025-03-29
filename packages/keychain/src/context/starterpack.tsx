import { createContext, PropsWithChildren } from "react";

export const enum StarterItemType {
  NFT = "NFT",
  CREDIT = "CREDIT",
}

export interface StarterItemData {
  title: string;
  collectionName?: string;
  description: string;
  price: number;
  image?: string;
  type: StarterItemType;
  value?: number;
}

export interface StarterPackContextType {
  balance: number;
  price: number;
  starterPackItems: StarterItemData[];
}

export const StarterPackContext = createContext<
  StarterPackContextType | undefined
>(undefined);

export function StarterPackProvider({
  children,
  balance,
  starterPackItems,
  price,
}: PropsWithChildren<StarterPackContextType>) {
  return (
    <StarterPackContext.Provider value={{ balance, starterPackItems, price }}>
      {children}
    </StarterPackContext.Provider>
  );
}
