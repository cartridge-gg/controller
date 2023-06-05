import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Token = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 16 20" fill="currentColor" __css={styles} {...rest}>
      <path
        fillRule="evenodd"
        d="M12.9995 12.1878V7.81224C12.9995 5.15451 10.845 3 8.18724 3C5.52951 3 3.375 5.15451 3.375 7.81224V12.1878C3.375 14.8455 5.52951 17 8.18724 17C10.845 17 12.9995 14.8455 12.9995 12.1878ZM8.18724 1C4.42494 1 1.375 4.04994 1.375 7.81224V12.1878C1.375 15.9501 4.42494 19 8.18724 19C11.9495 19 14.9995 15.9501 14.9995 12.1878V7.81224C14.9995 4.04994 11.9495 1 8.18724 1Z"
      />
      <path d="M8.18703 7.32261C8.73932 7.32261 9.18703 7.77033 9.18703 8.32261V11.6768C9.18703 12.2291 8.73932 12.6768 8.18703 12.6768C7.63475 12.6768 7.18703 12.2291 7.18703 11.6768V8.32261C7.18703 7.77033 7.63475 7.32261 8.18703 7.32261Z" />
    </Icon>
  );
};

export default Token;
