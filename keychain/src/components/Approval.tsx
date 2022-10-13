import { css } from "@emotion/react";
import { Box, Button, Flex, FormControl } from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps } from "formik";
import { Policy } from "@cartridge/controller";

import Triangle from "@cartridge/ui/components/icons/Triangle";

import Banner from "components/Banner";
import { Call, MaxFee } from "./Call";

type ApprovalFormProps = {
  action: string;
  policies: Policy[];
  invalidPolicys?: Policy[];
  isLoading?: boolean;
  maxFee?: string;
  setMaxFee?: (maxFee: string) => void;
  onSubmit: (values: any, actions: any) => Promise<void>;
  onCancel?: () => void;
};

const CallFields = ({
  policies,
  errMsg,
}: {
  policies: Policy[];
  errMsg?: string;
}) => (
  <>
    {policies.map((policy, i) => (
      <Field name={i} key={i}>
        {({ field }: { field: FieldInputProps<boolean> }) => (
          <FormControl>
            <Call {...field} policy={policy} errMsg={errMsg} />
          </FormControl>
        )}
      </Field>
    ))}
  </>
);

const ApprovalForm = ({
  action,
  policies,
  invalidPolicys,
  maxFee,
  isLoading,
  setMaxFee,
  onSubmit,
  onCancel,
}: ApprovalFormProps) => {
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
          <Triangle alignSelf="center" backgroundColor="#1A201C" />
          <Box flex={1} bgColor="#1A201C" borderRadius={16} m={"0 2 2 2"} p={8}>
            {!isLoading && (
              <>
                <CallFields policies={policies} />
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
                    policies={invalidPolicys}
                    errMsg={"Invalid Method Requested"}
                  />
                )}
              </>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection={["column-reverse", "row"]}
            justifyContent={["center", "flex-end"]}
            gap={4}
            mt={3}
          >
            {onCancel && (
              <Button
                variant="secondary600"
                size="lg"
                w={["100%", "200px"]}
                onClick={onCancel}
              >
                CANCEL
              </Button>
            )}
            <Button
              size="lg"
              isLoading={props.isSubmitting || isLoading}
              w={["100%", "200px"]}
              type="submit"
            >
              {action}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

const Approval = ({
  title,
  action,
  message,
  policies,
  invalidPolicys,
  maxFee,
  isLoading = false,
  setMaxFee,
  onSubmit,
  onCancel,
}: ApprovalFormProps & {
  message: React.ReactNode;
  title: string;
}) => {
  return (
    <Flex m={4} flex={1} flexDirection="column">
      <Banner title={title} variant="secondary">
        <Box mt={2} fontSize={13}>
          {message}
        </Box>
      </Banner>
      <Box mt={4} flex={1}>
        <ApprovalForm
          action={action}
          policies={policies}
          invalidPolicys={invalidPolicys}
          isLoading={isLoading}
          maxFee={maxFee}
          setMaxFee={setMaxFee}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </Box>
    </Flex>
  );
};

export default Approval;
