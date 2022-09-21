import { Box, Flex, Tag, Switch, Text, HStack, Link } from "@chakra-ui/react";
import { FieldInputProps } from "formik";
import { formatEther } from "ethers/lib/utils";
import { Scope } from "@cartridge/controller";

import Transfer from "@cartridge/ui/components/icons/Transfer";
import GasPump from "@cartridge/ui/components/icons/GasPump";
import { formatAddress } from "@cartridge/ui/components/Address";

import { VoyagerUrl } from "utils/url";

function formatName(scope: Scope) {
  if (scope.method) {
    return `Execute ${scope.method}`;
  }

  return `Execute ${formatAddress(scope.target, 6)}`;
}

function formatDescription(scope: Scope) {
  if (scope.method) {
    return `Execute ${scope.method} on ${formatAddress(scope.target, 6)}`;
  }

  return `Execute code on ${formatAddress(scope.target, 6)}`;
}

export const Call = ({
  scope,
  toggable = true,
  errMsg,
  ...rest
}: {
  scope: Scope;
  toggable?: boolean;
  errMsg?: string;
} & FieldInputProps<boolean>) => {
  const title = (
    <HStack>
      <Text>{formatName(scope)}</Text>
      {errMsg && (
        <Tag colorScheme="red" size="sm">
          {errMsg}
        </Tag>
      )}
    </HStack>
  );
  const description = (
    <Link href={VoyagerUrl.contract(scope.target)} target="_blank">
      {formatDescription(scope)}
    </Link>
  );

  return (
    <Base
      title={title}
      icon={<Transfer />}
      description={description}
      toggable={toggable}
      errMsg={errMsg}
      {...rest}
    />
  );
};

// TODO: need design for gas fee to also be input field
export const MaxFee = ({
  maxFee,
  ...rest
}: {
  maxFee: string;
} & FieldInputProps<boolean>) => {
  const title = `Max gas spend ${formatEther(maxFee)} ETH`;
  const description = "Game can spend no more than this amount of gas";
  return (
    <Base
      title={title}
      icon={<GasPump />}
      description={description}
      toggable={false}
      {...rest}
    />
  );
};

const Base = ({
  title,
  icon,
  description,
  toggable = true,
  disable = false,
  errMsg,
  ...rest
}: {
  icon: React.ReactElement;
  title: React.ReactElement | string;
  description?: React.ReactElement | string;
  disable?: boolean;
  errMsg?: string;
  toggable?: boolean;
} & FieldInputProps<boolean>) => (
  <Flex pb={5}>
    <Box mr={2}>{icon}</Box>
    <Box>
      {title}
      <Box color="#808080" fontSize={12} mt={2.5} mr={2.5}>
        {description}
      </Box>
    </Box>
    {toggable && (
      <Box ml="auto">
        <Switch
          disabled={disable || !!errMsg}
          size="lg"
          name={rest.name}
          isChecked={errMsg ? false : rest.value}
          onBlur={rest.onBlur}
          onChange={rest.onChange}
        />
      </Box>
    )}
  </Flex>
);
