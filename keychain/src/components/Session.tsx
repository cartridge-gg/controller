import { css } from "@emotion/react";
import { Flex, FormControl } from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps } from "formik";
import { Policy } from "@cartridge/controller";

import { CallToggle, MaxFee } from "./Call";
import Footer from "./Footer";

type SessionProps = {
  action: string;
  policies: Policy[];
  invalidPolicys?: Policy[];
  isLoading?: boolean;
  maxFee?: string;
  setMaxFee?: (maxFee: string) => void;
  onSubmit: (values: any, actions: any) => Promise<void>;
  onCancel?: () => void;
  toggable?: boolean
};

const CallFields = ({
  policies,
  notice,
}: {
  policies: Policy[];
  notice?: string;
}) => (
  <>
    {policies.map((policy, i) => (
      <Field key={i} name={i}>
        {({ field }: { field: FieldInputProps<boolean> }) => (
          <FormControl>
            <CallToggle {...field} policy={policy} notice={notice} />
          </FormControl>
        )}
      </Field>
    ))}
  </>
);

const Session = ({
  action,
  policies,
  invalidPolicys,
  maxFee,
  isLoading,
  setMaxFee,
  onSubmit,
  onCancel,
}: SessionProps) => {
  const initialValues = policies.reduce(
    (prev, _, i) => ({ ...prev, [i]: true }),
    {},
  );

  return (
    <Flex m={4} flex={1} flexDirection="column" gap="10px">
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
                      notice={"Invalid Method Requested"}
                    />
                  )}
                </>
              )}
            </Flex>
            <Footer isLoading={props.isSubmitting || isLoading} onCancel={onCancel} action={action} />
          </Form>
        )}
      </Formik>
    </Flex>
  );
};

export default Session;
