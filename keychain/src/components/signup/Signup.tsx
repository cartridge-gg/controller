import { useCallback, useEffect, useState } from "react";
import { Formik, Form, Field, FormikState } from "formik";
import { css } from "@emotion/react";
import {
  Box,
  Button,
  Flex,
  Input,
  InputProps,
  Tooltip,
  Circle,
  VStack,
  HStack,
  Text,
  Container,
  Link,
  Divider,
} from "@chakra-ui/react";

import JoystickIcon from "@cartridge/ui/components/icons/Joystick";
import LockIcon from "@cartridge/ui/components/icons/Lock";
import ArrowIcon from "@cartridge/ui/components/icons/Arrow";
import { Logo } from "@cartridge/ui/components/icons/brand/Logo";

export const Signup = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <VStack flex="1" gap="18px" padding="36px">
      <HStack spacing="14px" pt="36px">
        <Circle size="48px" bgColor="gray.700">
          <JoystickIcon boxSize="30px" />
        </Circle>
        <Ellipses />
        <Circle size="48px" bgColor="gray.700">
          <Logo boxSize="22px" color="brand" />
        </Circle>
      </HStack>
      <Text fontWeight="bold" fontSize="17px">
        Create New Controller
      </Text>

      <Formik initialValues={{ name: "" }} onSubmit={() => {}}>
        {(props) => (
          <Form
            css={css`
              display: flex;
              flex-direction: column;
              flex: 1;
              width: 100%;
              margin-top: 0px !important;
              gap: 24px;
            `}
          >
            <Field name="name">
              {({
                field,
              }: {
                field: InputProps;
                form: FormikState<{ name: string }>;
              }) => (
                <Input
                  {...field}
                  h="36px"
                  onChange={(e) => {}}
                  placeholder="Username"
                  autoComplete="off"
                />
              )}
            </Field>

            <HStack justify="center">
              <Text fontSize="12px" color="whiteAlpha.600" fontWeight="bold">
                Already have a controller?
              </Text>
              <Link variant="outline" fontSize="11px" onClick={onLogin}>
                Log In
              </Link>
            </HStack>
            <VStack
              position="fixed"
              bottom="0"
              right="0"
              w="full"
              p="36px"
              gap="24px"
            >
              <Divider borderColor="gray.600" />
              {/* <HStack>
                <LockIcon />
                <Text fontSize="12px" color="whiteAlpha.600">
                  By continuing you are agreeing to Cartridge's Terms of Service
                  and Privacy Policy
                </Text>
              </HStack> */}
              <Button w="full" gap="10px">
                Continue <ArrowIcon />
              </Button>
              {/* <Button>Continue with Discord</Button> */}
            </VStack>
          </Form>
        )}
      </Formik>
    </VStack>
  );
};

const Ellipses = () => {
  return (
    <HStack spacing="3px">
      <Circle size="4px" bgColor="gray.400" />
      <Circle size="4px" bgColor="gray.400" />
      <Circle size="4px" bgColor="gray.400" />
    </HStack>
  );
};
