import React from "react";
import {
  Text,
  Spacer,
  HStack,
} from "@chakra-ui/react";
import { Dropdown, Item } from "./Dropdown";
import { HeaderType } from "../Header";
import { AvatarA } from "../icons/Avatars";
import WalletIcon from "../icons/Wallet";
import ControllerIcon from "../icons/Controller";
import DiamondIcon from "../icons/Diamond";
import OutgoingIcon from "../icons/Outgoing";
import CopyIcon from "../icons/Copy";

export type MenuProps = {
  type: HeaderType;
  address: string;
  onLogout?: () => void;
};

const MenuDropdown = ({ type, address, onLogout }: MenuProps) => {
  const minWidth = "14px";
  const items: Item[] = [
    {
      label: getAddressLabel(address),
      icon: <WalletIcon minWidth={minWidth} />,
      onClick: async () => {
        await navigator.clipboard.writeText(address);
      },
    },
    {
      label: "Arcade",
      icon: <DiamondIcon minWidth={minWidth} />,
      color: type === HeaderType.Arcade ? "brand" : undefined,
      onClick: () => {
        if (type === HeaderType.Arcade) return;
        window.location.href = "https://cartridge.gg";
      },
    },
    {
      label: "Controller",
      icon: <ControllerIcon minWidth={minWidth} />,
      color: type === HeaderType.Controller ? "brand" : undefined,
      onClick: () => {
        if (type === HeaderType.Controller) return;
        window.location.href = "https://controller.cartridge.gg";
      },
    },
    {
      label: "Logout",
      icon: <OutgoingIcon minWidth={minWidth} />,
      onClick: onLogout,
    },
  ];
  return (
    <Dropdown
      showCaret={true}
      showBadge={false}
      badgeColor="red.400"
      items={items}
      icon={<AvatarA color="brand" />}
    />
  );
};

function getAddressLabel(address: string) {
  return (
    <HStack>
      <Text>
        {address && address.substr(0, 6) + "..." + address.substr(-4)}
      </Text>
      <Spacer />
      <CopyIcon />
    </HStack>
  );
}

export default MenuDropdown;
