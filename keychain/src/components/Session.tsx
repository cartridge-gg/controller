import { css } from "@emotion/react";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps } from "formik";
import { Policy } from "@cartridge/controller";

import Banner from "components/Banner";
import { Call, MaxFee } from "./Call";
import Controller from "utils/account";
import { StarknetChainId } from "starknet/constants";
import StarknetIcon from "@cartridge/ui/components/icons/Starknet";

type SessionFormProps = {
  action: string;
  policies: Policy[];
  invalidPolicys?: Policy[];
  isLoading?: boolean;
  maxFee?: string;
  setMaxFee?: (maxFee: string) => void;
  onSubmit: (values: any, actions: any) => Promise<void>;
  onCancel?: () => void;
  toggable?: boolean;
};

const CallFields = ({
  policies,
  errMsg,
  toggable,
}: {
  policies: Policy[];
  errMsg?: string;
  toggable?: boolean;
}) => (
  <>
    {policies.map((policy, i) => (
      <Box key={i} bgColor="gray.700" p="16px" borderRadius="8px">
        <Field name={i}>
          {({ field }: { field: FieldInputProps<boolean> }) => (
            <FormControl>
              <Call
                {...field}
                policy={policy}
                toggable={toggable}
                errMsg={errMsg}
              />
            </FormControl>
          )}
        </Field>
      </Box>
    ))}
  </>
);

const SessionForm = ({
  action,
  policies,
  invalidPolicys,
  maxFee,
  isLoading,
  setMaxFee,
  onSubmit,
  onCancel,
  toggable,
}: SessionFormProps) => {
  const initialValues = policies.reduce(
    (prev, _, i) => ({ ...prev, [i]: true }),
    {},
  );

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(props) => (
        <Form
          css={css`
            display: flex;
            flex-direction: column;
            height: 100%;
          `}
        >
          <Flex flex={1} direction="column" gap="12px">
            {!isLoading && (
              <>
                <CallFields policies={policies} toggable={toggable} />
                {maxFee && (
                  <Box bgColor="gray.700" p="16px" borderRadius="8px">
                    <Field>
                      {({ field }: { field: FieldInputProps<boolean> }) => (
                        <FormControl>
                          <MaxFee maxFee={maxFee} {...field} />
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                )}
                {invalidPolicys && (
                  <CallFields
                    policies={invalidPolicys}
                    errMsg={"Invalid Method Requested"}
                    toggable={toggable}
                  />
                )}
              </>
            )}
          </Flex>
          <Flex
            position="fixed"
            bottom="0"
            right="0"
            w="100%"
            p="16px"
            gap="10px"
            bgColor="gray.900"
            justify="flex-end"
          >
            {onCancel && (
              <Button
                variant="secondary600"
                size="lg"
                w={["100%", "100%", "200px"]}
                onClick={onCancel}
              >
                CANCEL
              </Button>
            )}
            <Button
              size="lg"
              isLoading={props.isSubmitting || isLoading}
              w={["100%", "100%", "200px"]}
              type="submit"
            >
              {action}
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

const Session = ({
  title,
  action,
  message,
  policies,
  invalidPolicys,
  maxFee,
  isLoading = false,
  setMaxFee,
  toggable,
  onSubmit,
  onCancel,
}: SessionFormProps & {
  message: React.ReactNode;
  title: string;
}) => {
  const controller = Controller.fromStore();

  return (
    <Flex m={4} flex={1} flexDirection="column" gap="10px">
      <Banner
        pb="20px"
        title={title}
        variant="secondary"
        borderBottom="1px solid"
        borderColor="gray.700"
      >
        {message}
        <Flex justify="center" mt="12px">
          <HStack
            h="24px"
            p="0 12px"
            borderRadius="12px"
            backgroundColor="whiteAlpha.200"
          >
            <StarknetIcon h="9px" w="9px" color="white" />
            <Text fontSize="10px" fontWeight="bold" letterSpacing="0.08em">
              {controller.chainId === StarknetChainId.MAINNET
                ? "MAINNET"
                : "TESTNET"}
            </Text>
          </HStack>
        </Flex>
      </Banner>
      <SessionForm
        action={action}
        policies={policies}
        invalidPolicys={invalidPolicys}
        isLoading={isLoading}
        toggable={toggable}
        maxFee={maxFee}
        setMaxFee={setMaxFee}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </Flex>
  );
};

export default Session;
