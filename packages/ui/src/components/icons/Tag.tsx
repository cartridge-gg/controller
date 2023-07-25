import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Tag = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 10 10" fill="currentColor" __css={styles} {...rest}>
      <path d="M1.4375 0.5H4.35742C4.68945 0.5 5.00586 0.631641 5.24023 0.866211L8.67773 4.30273C9.16602 4.79102 9.16602 5.58398 8.67773 6.07227L6.07227 8.67773C5.58398 9.16602 4.79102 9.16602 4.30273 8.67773L0.866211 5.24023C0.631699 5.00586 0.5 4.68945 0.5 4.35742V1.4375C0.5 0.919727 0.919727 0.5 1.4375 0.5ZM2.6875 3.3125C3.0332 3.3125 3.3125 3.0332 3.3125 2.6875C3.3125 2.3418 3.0332 2.0625 2.6875 2.0625C2.34238 2.0625 2.0625 2.3418 2.0625 2.6875C2.0625 3.0332 2.34238 3.3125 2.6875 3.3125Z" />
    </Icon>
  );
};

export default Tag;
