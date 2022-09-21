import { css } from "@emotion/react";
import { Box, Button, Flex, FormControl } from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps } from "formik";
import { Scope } from "@cartridge/controller";

import Triangle from "@cartridge/ui/components/icons/Triangle";
import { Header, HeaderType } from "@cartridge/ui/components/Header";

import Banner from "components/Banner";
import { Call, MaxFee } from "./Call";
import { useMemo } from "react";
import Controller from "utils/account";

type ApprovalFormProps = {
  action: string;
  scopes: Scope[];
  invalidScopes?: Scope[];
  isLoading?: boolean;
  maxFee?: string;
  setMaxFee?: (maxFee: string) => void;
  onSubmit: (values: any, actions: any) => Promise<void>;
  onCancel?: () => void;
};

const CallFields = ({
  scopes,
  errMsg,
}: {
  scopes: Scope[];
  errMsg?: string;
}) => (
  <>
    {scopes.map((scope, i) => (
      <Field name={i} key={i}>
        {({ field }: { field: FieldInputProps<boolean> }) => (
          <FormControl>
            <Call {...field} scope={scope} errMsg={errMsg} />
          </FormControl>
        )}
      </Field>
    ))}
  </>
);

const ApprovalForm = ({
  action,
  scopes,
  invalidScopes,
  maxFee,
  isLoading,
  setMaxFee,
  onSubmit,
  onCancel,
}: ApprovalFormProps) => {
  const initialValues = scopes.reduce(
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
                <CallFields scopes={scopes} />
                {maxFee && (
                  <Field>
                    {({ field }: { field: FieldInputProps<boolean> }) => (
                      <FormControl>
                        <MaxFee maxFee={maxFee} {...field} />
                      </FormControl>
                    )}
                  </Field>
                )}
                {invalidScopes && (
                  <CallFields
                    scopes={invalidScopes}
                    errMsg={"Invalid Method Requested"}
                  />
                )}
              </>
            )}
          </Box>
          <Box
            margin={2}
            display="flex"
            flexDirection={["column-reverse", "row"]}
            justifyContent={["center", "flex-end"]}
            gap={4}
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
  scopes,
  invalidScopes,
  maxFee,
  isLoading = false,
  setMaxFee,
  onSubmit,
  onCancel,
}: ApprovalFormProps & {
  message: React.ReactNode;
  title: string;
}) => {
  const controller = useMemo(() => Controller.fromStore(), [])
  return (
    <Flex
      position={"fixed"}
      direction={"column"}
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      <Header
        type={HeaderType.Controller}
        address={controller.address}
      />
      <Flex m={4} flex={1} flexDirection="column">
        <Banner title={title} variant="secondary">
          <Box mt={2} fontSize={13}>
            {message}
          </Box>
        </Banner>
        <Box mt={4} flex={1}>
          <ApprovalForm
            action={action}
            scopes={scopes}
            invalidScopes={invalidScopes}
            isLoading={isLoading}
            maxFee={maxFee}
            setMaxFee={setMaxFee}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Approval;
