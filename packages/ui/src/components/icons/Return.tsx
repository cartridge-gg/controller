import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Return = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 25 25" fill="currentColor" __css={styles} {...rest}>
      <path d="M4.87109 14L9.62109 19H10.8711V15.5H19.3711H20.8711V14V7.5V6H17.8711V7.5V12.5H10.8711V9H9.62109L4.87109 14Z" />
    </Icon>
  );
};

export default Return;
