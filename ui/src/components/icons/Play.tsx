import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Play = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 16 18"
      width="16"
      height="18"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path d="M15.0069 7.35394C15.5815 7.70757 15.9311 8.33044 15.9311 9.00153C15.9311 9.67263 15.5815 10.2955 15.0069 10.613L3.43473 17.6856C2.83918 18.0834 2.09375 18.0995 1.48534 17.7579C0.876817 17.4163 0.5 16.7734 0.5 16.0741V1.92893C0.5 1.23132 0.876817 0.58795 1.48534 0.246375C2.09375 -0.0947976 2.83918 -0.0807328 3.43473 0.282944L15.0069 7.35394Z" />
    </Icon>
  );
};

export default Play;
