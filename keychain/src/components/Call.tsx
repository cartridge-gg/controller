import {
  Flex,
  Tag,
  Text,
  HStack,
  Link,
  Input,
  Spacer,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import { FieldInputProps } from "formik";
import { formatEther } from "ethers/lib/utils";
import { Policy } from "@cartridge/controller";
import { formatAddress } from "@cartridge/ui/components/Address";
import { StarkscanUrl } from "utils/url";
import EthereumIcon from "@cartridge/ui/components/icons/Ethereum";
import CodeIcon from "@cartridge/ui/components/icons/Code";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import { constants } from "starknet";

export const Call = ({
  chainId,
  policy,
  notice,
}: {
  chainId: constants.StarknetChainId;
  policy: Policy;
  notice?: string;
}) => {
  const title = (
    <HStack>
      <Text variant="ibm-upper-bold">{policy.method}</Text>
      {notice && (
        <Tag colorScheme="red" size="sm">
          {notice}
        </Tag>
      )}
    </HStack>
  );

  const description = (
    <Link href={StarkscanUrl(chainId).contract(policy.target)} target="_blank">
      {policy.target}
    </Link>
  );

  return <Base title={title} description={description} />;
};

export const CallToggle = ({
  chainId,
  policy,
  notice,
  ...rest
}: {
  chainId: constants.StarknetChainId;
  policy: Policy;
  notice?: string;
} & FieldInputProps<boolean>) => {
  return (
    <HStack w="full" bgColor="gray.600" py="7px" px="12px">
      <CodeIcon boxSize="18px" />
      <Text fontSize="13px" textTransform="capitalize">
        {policy.method}
      </Text>
      <Spacer />
      <Tooltip label={`View on Starkscan`} placement="left" hasArrow>
        <Link
          href={StarkscanUrl(chainId).contract(policy.target, "write-contract")}
          isExternal
        >
          <InfoIcon color="gray.200" boxSize="12px" />
        </Link>
      </Tooltip>
    </HStack>
  );
};

export const MaxFee = ({
  maxFee,
  ...rest
}: {
  maxFee: string;
} & FieldInputProps<boolean>) => {
  const eth = formatEther(maxFee);
  const title = `Max gas spend ${eth} ETH`;
  const description = "Game can spend no more than this amount of gas";
  return (
    <>
      <Switchable
        title={title}
        description={description}
        toggable={false}
        {...rest}
      />
      <HStack pt="14px">
        <HStack position="relative" maxWidth="30%">
          <Input type="number" value={eth} pl="30px"></Input>
          <EthereumIcon position="absolute" boxSize="14px" color="gray.200" />
        </HStack>
        <Spacer />
        <Text></Text>
      </HStack>
    </>
  );
};

const Switchable = ({
  title,
  description,
  toggable = true,
  disable = false,
  errMsg,
  ...rest
}: {
  title: React.ReactElement | string;
  description?: React.ReactElement | string;
  disable?: boolean;
  errMsg?: string;
  toggable?: boolean;
} & FieldInputProps<boolean>) => (
  <Flex>
    <Base title={title} description={description} />
  </Flex>
);

const Base = ({
  title,
  description,
}: {
  title: React.ReactElement | string;
  description?: React.ReactElement | string;
  disable?: boolean;
  errMsg?: string;
}) => (
  <HStack w="full" bgColor="gray.600" py="7px" px="12px">
    <CodeIcon boxSize="18px" />
    <Text fontSize="13px" textTransform="capitalize">
      {title}
    </Text>
    <Spacer />
    <InfoIcon color="gray.200" boxSize="12px" />
  </HStack>
);
