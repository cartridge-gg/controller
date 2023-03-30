import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Wallet = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 16 16" __css={styles} fill="currentColor" {...rest}>
      <path
        d="M12.6667 3.3335H2.66675V12.6668H13.3334V5.3335H4.00008V4.66683H12.6667V3.3335ZM11.3334 9.66683C10.9647 9.66683 10.6667 9.36891 10.6667 9.00016C10.6667 8.63141 10.9647 8.3335 11.3334 8.3335C11.7022 8.3335 12.0001 8.63141 12.0001 9.00016C12.0001 9.36891 11.7022 9.66683 11.3334 9.66683Z"
        fill="currentColor"
      />
    </Icon>
  );
};

export default Wallet;



