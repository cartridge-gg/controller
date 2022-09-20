import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const ChevronDown = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 8 5"
      h="5px"
      w="8px"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path
        d="M3.99992 4.33301C3.87198 4.33301 3.74398 4.28418 3.64648 4.18652L0.646484 1.18652C0.451172 0.991211 0.451172 0.674805 0.646484 0.479492C0.841797 0.28418 1.1582 0.28418 1.35352 0.479492L3.99992 3.12676L6.6468 0.479883C6.84211 0.28457 7.15852 0.28457 7.35383 0.479883C7.54914 0.675195 7.54914 0.991601 7.35383 1.18691L4.35383 4.18691C4.25617 4.28457 4.12805 4.33301 3.99992 4.33301Z"
        fill="white"
      />
    </Icon>
  );
};

export default ChevronDown;
