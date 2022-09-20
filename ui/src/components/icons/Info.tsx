import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Info = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 12 12" fill="currentColor" __css={styles} {...rest}>
      <path d="M6 0C2.68594 0 0 2.68594 0 6C0 9.31406 2.68594 12 6 12C9.31406 12 12 9.31406 12 6C12 2.68594 9.31406 0 6 0ZM6 3C6.41414 3 6.75 3.33586 6.75 3.75C6.75 4.16414 6.41414 4.5 6 4.5C5.58586 4.5 5.25 4.16484 5.25 3.75C5.25 3.33516 5.58516 3 6 3ZM6.9375 9H5.0625C4.75313 9 4.5 8.74922 4.5 8.4375C4.5 8.12578 4.75195 7.875 5.0625 7.875H5.4375V6.375H5.25C4.93945 6.375 4.6875 6.12305 4.6875 5.8125C4.6875 5.50195 4.94063 5.25 5.25 5.25H6C6.31055 5.25 6.5625 5.50195 6.5625 5.8125V7.875H6.9375C7.24805 7.875 7.5 8.12695 7.5 8.4375C7.5 8.74805 7.24922 9 6.9375 9Z" />
    </Icon>
  );
};

export default Info;
