import { useConnection } from "hooks/connection";
import {
  ETH_CONTRACT_ADDRESS,
  useCreditBalance as useCreditBalanceRaw,
  useERC20Balance,
} from "@cartridge/utils";

export function useEthBalance() {
  const { controller } = useConnection();
  return useERC20Balance({
    address: controller.address,
    contractAddress: ETH_CONTRACT_ADDRESS,
    provider: controller,
    interval: 3000,
  });
}

export function useCreditBalance() {
  const { controller } = useConnection();
  return useCreditBalanceRaw({
    address: controller.address,
    interval: 3000,
  });
}
