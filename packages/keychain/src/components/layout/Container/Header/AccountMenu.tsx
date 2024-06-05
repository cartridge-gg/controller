import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  HStack,
  Text,
  Spacer,
} from "@chakra-ui/react";
import {
  WedgeDownIcon,
  WalletIcon,
  CopyIcon,
  LogoutDuoIcon,
} from "@cartridge/ui";
import { useAvatar as useAvatarRaw } from "hooks/avatar";
// import { useBalanceQuery } from "generated/graphql";
// import { CONTRACT_POINTS } from "@cartridge/controller/src/constants";

export function AccountMenu({
  address,
  onLogout,
}: {
  address: string;
  onLogout: () => void;
}) {
  const avatar = useAvatar(address);

  return (
    <Menu>
      <MenuButton h={8}>
        <HStack spacing={2}>
          <Box
            w="18px"
            h="18px"
            dangerouslySetInnerHTML={
              !!avatar?.svg ? { __html: avatar?.svg } : undefined
            }
          />
          <WedgeDownIcon boxSize={4} />
        </HStack>
      </MenuButton>

      <MenuList position="absolute" top={3} right={-10}>
        <MenuItem
          icon={<WalletIcon boxSize={4} />}
          onClick={() => {
            navigator.clipboard.writeText(address);
          }}
        >
          <HStack>
            <Text>
              {`${address.slice(0, 3)}...${address.slice(
                address.length - 4,
                address.length,
              )}`}
            </Text>
            <Spacer />
            <CopyIcon />
          </HStack>
        </MenuItem>

        <MenuItem icon={<LogoutDuoIcon boxSize={4} />} onClick={onLogout}>
          <Text>Log Out</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

function useAvatar(address: string) {
  const { current: avatar } = useAvatarRaw(address || "", 10);
  return avatar;
}

// function usePointsData(address: string) {
//   const pointsChain = "starknet:SN_SEPOLIA";
//   const pointsTokenAccountId = `${pointsChain}/${pointsChain}:${
//     address || ""
//   }/erc20:${CONTRACT_POINTS}`;

//   return useBalanceQuery({
//     tokenAccountId: pointsTokenAccountId,
//   });
// }
