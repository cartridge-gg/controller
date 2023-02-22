import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const EthereumLarge = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 30 30" fill="currentColor" __css={styles} {...rest}>
      <path d="M14.9971 4V12.1325L21.8708 15.204L14.9971 4Z" fill="#CAF1CA" />
      <path d="M14.9986 4L8.12402 15.204L14.9986 12.1325V4Z" fill="currentColor" />
      <path d="M14.9971 20.4745V26.0004L21.8753 16.4844L14.9971 20.4745Z" fill="white" fillOpacity="0.48" />
      <path d="M14.9986 26.0004V20.4736L8.12402 16.4844L14.9986 26.0004Z" fill="currentColor" />
      <path d="M14.9971 19.1955L21.8708 15.2044L14.9971 12.1348V19.1955Z" fill="white" fillOpacity="0.48" />
      <path d="M8.12402 15.2044L14.9986 19.1955V12.1348L8.12402 15.2044Z" fill="#CAF1CA" />
    </Icon>
  );
};

export default EthereumLarge;
