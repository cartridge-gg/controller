import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const LogoutLarge = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 40 40" fill="currentColor" __css={styles} {...rest}>
      <path
        d="M33.3992 21.262L34.6668 20L33.4048 18.738L26.2572 11.5903L24.9896 10.3228L22.46 12.8524L23.722 14.1144L27.8207 18.2131H16.055H14.2681V21.7869H16.055H27.8207L23.722 25.8857L22.46 27.1477L24.9896 29.6773L26.2516 28.4153L33.3992 21.2676V21.262Z"
        fill="currentColor"
      />
      <path
        d="M14.2681 11.0655H16.055V7.4917H14.2681H7.12041H5.3335V9.27861V30.7216V32.5085H7.12041H14.2681H16.055V28.9347H14.2681H8.90733V11.0655H14.2681Z"
        fill="white"
        fillOpacity="0.48"
      />
    </Icon>
  );
};

export default LogoutLarge;
