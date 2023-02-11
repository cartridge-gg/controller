import { css } from "@emotion/react";
import { Flex, Text, VStack, FormControl } from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps } from "formik";
import { Policy } from "@cartridge/controller";

import { CallToggle, MaxFee } from "./Call";
import Footer from "./Footer";
import { constants } from "starknet";
import { useState } from "react";
type SessionProps = {
  chainId: constants.StarknetChainId;
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
  chainId,
  policies,
  notice,
}: {
  chainId: constants.StarknetChainId;
  policies: Policy[];
  notice?: string;
}) => (
  <>
    {policies.map((policy, i) => (
      <Field key={i} name={i}>
        {({ field }: { field: FieldInputProps<boolean> }) => (
          <FormControl>
            <CallToggle
              {...field}
              chainId={chainId}
              policy={policy}
              notice={notice}
            />
          </FormControl>
        )}
      </Field>
    ))}
  </>
);

const Session = ({
  chainId,
  action,
  policies,
  invalidPolicys,
  maxFee,
  isLoading,
  setMaxFee,
  onSubmit,
  onCancel,
}: SessionProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const initialValues = policies.reduce(
    (prev, _, i) => ({ ...prev, [i]: true }),
    {},
  );

  return (
    <Flex w="full" flexDirection="column" gap="10px">
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          setIsSubmitting(true);
          onSubmit(values, actions);
        }}
      >
        {(props) => (
          <Form
            css={css`
              display: flex;
              flex-direction: column;
            `}
          >
            <Flex
              direction="column"
              gap="1px"
              borderRadius="6px"
              overflow="hidden"
            >
              {policies.length > 0 && (
                <VStack align="flex-start" p="12px" bgColor="gray.700">
                  <Text
                    variant="ibm-upper-bold"
                    color="gray.200"
                    fontSize="10px"
                  >
                    Actions
                  </Text>
                  <Text fontSize="11px" color="gray.200">
                    Allow controller to execute following actions on your behalf
                  </Text>
                </VStack>
              )}
              {!isLoading && (
                <>
                  <CallFields chainId={chainId} policies={policies} />
                  {maxFee && (
                    <Field>
                      {({ field }: { field: FieldInputProps<boolean> }) => (
                        <FormControl>
                          <MaxFee maxFee={maxFee} {...field} />
                        </FormControl>
                      )}
                    </Field>
                  )}
                  {invalidPolicys && (
                    <CallFields
                      chainId={chainId}
                      policies={invalidPolicys}
                      notice={"Invalid Method Requested"}
                    />
                  )}
                </>
              )}
            </Flex>
            <Footer
              isLoading={isSubmitting || isLoading}
              onCancel={onCancel}
              confirmText={action}
            />
          </Form>
        )}
      </Formik>
    </Flex>
  );
};

export default Session;
