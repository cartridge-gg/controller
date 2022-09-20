import React, { useState } from "react";
import {
  Box,
  Circle,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import ChevronIcon from "../icons/ChevronDown";

export type Item = {
  label: React.ReactElement | string;
  icon?: React.ReactElement;
  color?: string;
  onClick?: () => void;
};

export type DropdownProps = {
  icon: React.ReactElement;
  items: Item[];
  showCaret?: boolean;
  showBadge?: boolean;
  badgeColor?: string;
};

export const Dropdown = ({
  icon,
  items,
  showBadge = false,
  showCaret = false,
  badgeColor = "brand",
}: DropdownProps) => {
  // dead click for menu dismiss
  const [overlay, setOverlay] = useState<boolean>(false);
  const [selected, setSelected] = useState<Item>();
  return (
    <Menu
      placement="bottom-end"
      autoSelect={false}
      onOpen={() => {
        setOverlay(true);
      }}
    >
      {({ isOpen }) => (
        <>
          <MenuButton position="relative">
            {icon}
            {showCaret && (
              <ChevronIcon
                w="14px"
                ml="10px"
                fill="gray.200"
                transform={isOpen ? "rotate(180deg)" : undefined}
                transition="transform 0.2s"
              />
            )}
            {showBadge && (
              <Circle
                position="absolute"
                top="-1px"
                right="-1px"
                size="16px"
                border="3px solid"
                borderColor="gray.800"
                bgColor={badgeColor}
              />
            )}
          </MenuButton>
          <MenuList
            onTransitionEnd={() => {
              if (!isOpen && selected?.onClick) {
                selected.onClick();
              }
            }}
          >
            {items.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                color={item.color}
                onClick={() => {
                  setOverlay(false);
                  setSelected(item);
                }}
                _hover={{
                  color: item.color || "white",
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuList>
          {overlay && (
            <Box
              top="0"
              left="0"
              h="100vh"
              w="100vw"
              position="fixed"
              onClick={() => {
                setOverlay(false);
              }}
            />
          )}
        </>
      )}
    </Menu>
  );
};
