import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Bookmark = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 32 40" fill="currentColor" __css={styles} {...rest}>
      <path d="M2 0C0.895431 0 0 0.895431 0 2V38.2902C0 39.055 0.823658 39.5367 1.49026 39.1617L15.5097 31.2758C15.8142 31.1045 16.1858 31.1045 16.4903 31.2758L30.5097 39.1617C31.1763 39.5367 32 39.055 32 38.2902V2C32 0.895431 31.1046 0 30 0H2Z" />
      <path
        d="M13.5752 19.462L10.666 16.5528L11.6355 15.5833L13.5752 17.523L20.3632 10.7344L21.3327 11.7045L13.5752 19.462Z"
        fill="#584882"
      />
    </Icon>
  );
};

export default Bookmark;
