import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Lock = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 18 18" fill="currentColor" __css={styles} {...rest}>
      <path
        d="M7.125 6.375V7.5H10.875V6.375C10.875 5.33906 10.0359 4.5 9 4.5C7.96406 4.5 7.125 5.33906 7.125 6.375ZM5.625 7.5V6.375C5.625 4.51172 7.13672 3 9 3C10.8633 3 12.375 4.51172 12.375 6.375V7.5H12.75C13.5773 7.5 14.25 8.17266 14.25 9V13.5C14.25 14.3273 13.5773 15 12.75 15H5.25C4.42266 15 3.75 14.3273 3.75 13.5V9C3.75 8.17266 4.42266 7.5 5.25 7.5H5.625Z"
        fill="#808080"
      />
    </Icon>
  );
};

export default Lock;
