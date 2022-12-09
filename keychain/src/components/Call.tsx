import {
  Box,
  Flex,
  Tag,
  Switch,
  Text,
  HStack,
  Link,
  Input,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { FieldInputProps } from "formik";
import { formatEther } from "ethers/lib/utils";
import { Policy } from "@cartridge/controller";
import { formatAddress } from "@cartridge/ui/components/Address";
import { StarkscanUrl } from "utils/url";
import EthereumIcon from "@cartridge/ui/components/icons/Ethereum";
import { constants } from "starknet";

function formatName(policy: Policy) {
  if (policy.method) {
    return `Execute ${policy.method}`;
  }

  return `Execute ${formatAddress(policy.target, 6)}`;
}

function formatDescription(policy: Policy) {
  if (policy.method) {
    return `Execute ${policy.method} on ${formatAddress(policy.target, 6)}`;
  }

  return `Execute code on ${formatAddress(policy.target, 6)}`;
}

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
      <Text variant="ibm-upper-bold">{formatName(policy)}</Text>
      {notice && (
        <Tag colorScheme="red" size="sm">
          {notice}
        </Tag>
      )}
    </HStack>
  );

  const description = (
    <Link href={StarkscanUrl[chainId].contract(policy.target)} target="_blank">
      {formatDescription(policy)}
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
  const title = (
    <HStack>
      <Text>{formatName(policy)}</Text>
      {notice && (
        <Tag colorScheme="red" size="sm">
          {notice}
        </Tag>
      )}
    </HStack>
  );
  const description = (
    <Link href={StarkscanUrl[chainId].contract(policy.target)} target="_blank">
      {formatDescription(policy)}
    </Link>
  );

  return (
    <Switchable
      title={title}
      description={description}
      errMsg={notice}
      {...rest}
    />
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
    <Spacer />
    <Switch
      disabled={disable || !!errMsg}
      size="lg"
      name={rest.name}
      isChecked={errMsg ? false : rest.value}
      onBlur={rest.onBlur}
      onChange={rest.onChange}
    />
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
  <VStack
    align="flex-start"
    spacing="8px"
    bgColor="gray.700"
    p="16px"
    borderRadius="8px"
  >
    <Box fontSize="11px">{title}</Box>
    <Text fontSize="12px" color="gray.200">
      {description}
    </Text>
  </VStack>
);
