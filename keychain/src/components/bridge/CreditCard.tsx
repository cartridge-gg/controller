import {
  Box,
  Circle,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import Container from "components/Container";
import { Header } from "components/Header";
import { constants } from "starknet";
import Controller from "utils/controller";
import CreditCardIcon from "components/icons/CreditCard";
import Label from "components/Label";
import Footer from "components/Footer";
import { Field, Form, Formik, FormikValues } from "formik";
import { useCallback } from "react";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { RampApiKey } from "./constants";

const CreditCard = ({
  chainId,
  controller,
  onBack,
  onClose,
  onLogout,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onBack: () => void;
  onClose: () => void;
  onLogout: () => void;
}) => {
  const ramp = useCallback(
    (value: string) =>
      new RampInstantSDK({
        variant: "hosted-auto",
        hostApiKey: RampApiKey,
        hostAppName: "Cartridge",
        hostLogoUrl: "https://docs.cartridge.gg/img/logo.svg",
        enabledFlows: ["ONRAMP"],
        fiatCurrency: "USD",
        fiatValue: value,
        swapAsset: "STARKNET_*",
        userAddress: controller.address,
      }),
    [controller.address],
  );

  return (
    <Container>
      <Header
        chainId={chainId}
        address={controller.address}
        onBack={onBack}
        onClose={onClose}
        onLogout={onLogout}
      />
      <HStack justify="start" w="full" spacing="18px" mt="-18px" mb="24px">
        <Circle bgColor="gray.700" size="48px">
          <CreditCardIcon color="green.400" boxSize="30px" />
        </Circle>
        <Text fontSize="17px" fontWeight="600">
          Add Funds
        </Text>
      </HStack>
      <Formik
        initialValues={{
          amount: "",
        }}
        onSubmit={(values: FormikValues) => {
          ramp(values.amount.toString()).show();
          onClose();
        }}
        validate={(values) => {
          const errors: any = {};
          if (!values.amount || values.amount === "") {
            errors.amount = "Required";
          } else if (!Number.isInteger(values.amount)) {
            errors.amount = "Must be a whole number";
          }
          return errors;
        }}
        validateOnChange
      >
        {(props) => (
          <Form style={{ width: "100%" }} autoComplete="off">
            <VStack spacing="18px" w="full">
              <HStack w="full" pt="8px">
                <Label>Amount</Label>
              </HStack>
              <Field name="amount">
                {({ field, meta }) => (
                  <HStack w="full" spacing="0">
                    <Tooltip
                      variant="error"
                      label={meta.error}
                      isOpen={meta.error}
                      hasArrow
                    >
                      <InputGroup>
                        <InputLeftAddon
                          bgColor="gray.600"
                          h="42px"
                          userSelect="none"
                        >
                          {"$"}
                        </InputLeftAddon>
                        <Input
                          variant="dark"
                          id="amount"
                          name="amount"
                          placeholder="Enter amount"
                          type="number"
                          border="1px solid"
                          errorBorderColor="red.400"
                          borderColor="transparent"
                          isInvalid={meta.isTouched && meta.error}
                          {...field}
                        />
                      </InputGroup>
                    </Tooltip>
                  </HStack>
                )}
              </Field>
            </VStack>
            <Box
              w="full"
              mt="230px"
              borderTop="1px solid"
              borderTopColor="gray.700"
            />
            <Footer
              showCancel={false}
              confirmText="Purchase ETH"
              isDisabled={!props.isValid}
            />
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default CreditCard;
