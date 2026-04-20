import { createContext } from "react";

type UIContextValue = {
  account?: {
    username: string;
    address: string;
  };
  chainId?: string;
  followers?: number;
  followings?: number;
  onFollowersClick?: () => void;
  onFollowingsClick?: () => void;
  closeModal?: () => void;
  openSettings?: () => void;
  showQrCode?: (show: boolean) => void;
  onLogout?: () => void;
};

export const UIContext = createContext<UIContextValue>({});

export const UIProvider = UIContext.Provider;
