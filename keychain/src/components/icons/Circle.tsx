import { Icon, useStyleConfig } from "@chakra-ui/react";

const Circle = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 25 25" fill="currentColor" __css={styles} {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.8711 19C16.4609 19 19.3711 16.0899 19.3711 12.5C19.3711 8.91015 16.4609 6 12.8711 6C9.28124 6 6.37109 8.91015 6.37109 12.5C6.37109 16.0899 9.28124 19 12.8711 19ZM12.8711 20.5C17.2894 20.5 20.8711 16.9183 20.8711 12.5C20.8711 8.08172 17.2894 4.5 12.8711 4.5C8.45282 4.5 4.87109 8.08172 4.87109 12.5C4.87109 16.9183 8.45282 20.5 12.8711 20.5Z"
        fill="currentColor"
      />
    </Icon>
  );
};

export default Circle;
