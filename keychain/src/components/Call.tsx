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
import { VoyagerUrl } from "utils/url";
import EthereumIcon from "@cartridge/ui/components/icons/Ethereum";

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
  policy,
  toggable = true,
  errMsg,
  ...rest
}: {
  policy: Policy;
  toggable?: boolean;
  errMsg?: string;
} & FieldInputProps<boolean>) => {
  const title = (
    <HStack>
      <Text>{formatName(policy)}</Text>
      {errMsg && (
        <Tag colorScheme="red" size="sm">
          {errMsg}
        </Tag>
      )}
    </HStack>
  );
  const description = (
    <Link href={VoyagerUrl.contract(policy.target)} target="_blank">
      {formatDescription(policy)}
    </Link>
  );

  return (
    <Base
      title={title}
      description={description}
      toggable={toggable}
      errMsg={errMsg}
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
      <Base
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

const Base = ({
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
    <VStack align="flex-start" spacing="12px">
      <Text variant="ibm-upper-bold" fontSize="11px">
        {title}
      </Text>
      <Text fontSize="12px" color="gray.200">
        {description}
      </Text>
    </VStack>
    <Spacer />
    {toggable && (
      <Switch
        disabled={disable || !!errMsg}
        size="lg"
        name={rest.name}
        isChecked={errMsg ? false : rest.value}
        onBlur={rest.onBlur}
        onChange={rest.onChange}
      />
    )}
  </Flex>
);
