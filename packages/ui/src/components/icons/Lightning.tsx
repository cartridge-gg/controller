import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Lightning = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 6 6"
      h="6px"
      w="6px"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path d="M5.66699 -3.05176e-05L1.3812 2.57119L2.80968 3.42875L0.666992 5.99997L4.95278 3.42875L3.52431 2.57119L5.66699 -3.05176e-05Z" />
    </Icon>
  );
};

export default Lightning;
