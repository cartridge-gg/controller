import { Icon, useStyleConfig } from "@chakra-ui/react";

const Fingerprint = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon width="24" height="18" viewBox="0 0 24 18" __css={styles} {...rest}>
      <path
        d="M0 9C0 7.89543 0.895431 7 2 7H8C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11H2C0.89543 11 0 10.1046 0 9Z"
        fill="#4D554D"
      />
      <path
        d="M12 9C12 7.89543 12.8954 7 14 7H22C23.1046 7 24 7.89543 24 9C24 10.1046 23.1046 11 22 11H14C12.8954 11 12 10.1046 12 9Z"
        fill="#4D554D"
      />
      <path
        d="M0 16C0 14.8954 0.895431 14 2 14H13C14.1046 14 15 14.8954 15 16C15 17.1046 14.1046 18 13 18H2C0.89543 18 0 17.1046 0 16Z"
        fill="#4D554D"
      />
      <path
        d="M17 16C17 14.8954 17.8954 14 19 14C20.1046 14 21 14.8954 21 16C21 17.1046 20.1046 18 19 18C17.8954 18 17 17.1046 17 16Z"
        fill="#4D554D"
      />
      <path
        d="M0 2C0 0.895431 0.895431 0 2 0H22C23.1046 0 24 0.895431 24 2C24 3.10457 23.1046 4 22 4H2C0.89543 4 0 3.10457 0 2Z"
        fill="#4D554D"
      />
    </Icon>
  );
};

export default Fingerprint;
