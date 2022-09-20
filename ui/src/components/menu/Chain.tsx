import React, { Image, Circle } from "@chakra-ui/react";
import { Dropdown, Item } from "./Dropdown";

const ChainDropdown = () => {
  const items: Item[] = [
    // {
    //   label: "Ethereum Mainnet",
    //   icon: <Circle bg="green.400" size="10px" />,
    //   onClick: () => {},
    // },
    {
      label: "Goerli Testnet",
      icon: <Circle bg="yellow.400" size="10px" />,
      onClick: () => {},
    },
  ];
  return (
    <Dropdown
      showBadge={false}
      badgeColor="yellow.400"
      items={items}
      icon={
        <Image
          my="4px"
          w="16px"
          h="16px"
          src="https://controller.cartridge.gg/starknet-icon.png"
        />
      }
    />
  );
};

export default ChainDropdown;
