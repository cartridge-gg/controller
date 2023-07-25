import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const ChevronRight = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 5 8"
      h="8px"
      w="5px"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path d="M4.57122 4.00027C4.57122 4.14648 4.51542 4.29275 4.40382 4.40418L0.975403 7.8326C0.752199 8.0558 0.390608 8.0558 0.167403 7.8326C-0.0558011 7.60939 -0.0558011 7.2478 0.167403 7.0246L3.19271 4.00027L0.167849 0.975403C-0.0553551 0.752198 -0.0553551 0.390607 0.167849 0.167403C0.391054 -0.0558014 0.752645 -0.0558014 0.975849 0.167403L4.40427 3.59582C4.51587 3.70742 4.57122 3.85385 4.57122 4.00027Z" />
    </Icon>
  );
};

export default ChevronRight;
