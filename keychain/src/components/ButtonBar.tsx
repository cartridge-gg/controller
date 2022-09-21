import { Flex, Button, Box } from "@chakra-ui/react";
import { css } from "@emotion/react";
import ClockIcon from "@cartridge/ui/components/icons/Clock";

export type ButtonBarProps = {
  onSubmit?: () => void;
  onCancel?: () => void;
  expiresIn?: string;
  isSubmitting: boolean;
  children: React.ReactNode;
};

const ButtonBar = ({
  onSubmit,
  onCancel,
  expiresIn,
  isSubmitting,
  children,
}: ButtonBarProps) => {
  return (
    <Flex
      flexDirection={["column", "row"]}
      justifyContent="space-between"
      mt={"5"}
    >
      {expiresIn && (
        <Flex
          my={["5", "0"]}
          alignSelf="center"
          fontFamily="LD_Mono"
          alignItems="center"
        >
          <ClockIcon
            mr="3"
            css={css`
              width: 16px;
              height: 16px;
            `}
          />
          EXPIRES IN {expiresIn}
        </Flex>
      )}
      <Flex flexDirection={["column-reverse", "row"]} alignItems="center">
        {onCancel && (
          <Button
            variant="secondary600"
            size="lg"
            w={["100%", "200px"]}
            mr={["0", "3"]}
            mt={["3", "0"]}
            onClick={onCancel}
          >
            CANCEL
          </Button>
        )}
        <Button
          size="lg"
          w={["100%", "200px"]}
          isLoading={isSubmitting}
          type="submit"
          onClick={onSubmit}
        >
          {children}
        </Button>
      </Flex>
    </Flex>
  );
};

export default ButtonBar;
