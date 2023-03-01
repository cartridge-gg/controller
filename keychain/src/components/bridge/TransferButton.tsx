import { Button } from "@chakra-ui/react";
import { parseEther } from "ethers/lib/utils.js";
import { useEffect } from "react";
import { Chain, useContractWrite, usePrepareContractWrite } from "wagmi";

const TransferButton = ({
  ethChain,
  ethContractAddress,
  ethContractABI,
  ethContractFunctionName,
  value,
  args,
  disabled,
  onError,
}: {
  ethChain: Chain;
  ethContractAddress: `0x${string}`;
  ethContractABI: any;
  ethContractFunctionName: string;
  value: string;
  args: any[];
  disabled: boolean;
  onError: (err: any) => void;
}) => {
  const { config, error: configError } = usePrepareContractWrite({
    chainId: ethChain.id,
    address: ethContractAddress,
    abi: ethContractABI,
    functionName: ethContractFunctionName,
    args: args,
    overrides: {
      value: value ? parseEther(value) : undefined
    }
  });
  const { data, write } = useContractWrite(config);

  useEffect(() => {
    if (configError) {
      onError(configError);
    } else {
      // reset err message
      onError(null);
    }
  }, [configError, onError]);

  return (
    <Button
      w="full"
      disabled={
        disabled || !write
      }
      onClick={() => write?.()}
    >Transfer</Button>
  );
};

export default TransferButton;
