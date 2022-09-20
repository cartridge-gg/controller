import { Icon, useStyleConfig } from "@chakra-ui/react";

export const Logo = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Logo", { variant, size });
  return (
    <Icon
      viewBox="0 0 244 197"
      w="87"
      h="70"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      {props.gradient ? (
        <>
          <defs>
            <mask id="mask-path">
              <LogoPath />
            </mask>
            <linearGradient
              id="gradient"
              gradientTransform="translate(0, 0.25) rotate(45)"
            >
              <stop offset="30%" stopColor="#AD75F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#F69C75" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            height="100%"
            width="100%"
            fill="url(#gradient)"
            mask="url(#mask-path)"
          />
        </>
      ) : (
        <LogoPath />
      )}
    </Icon>
  );
};

const LogoPath = () => (
  <>
    <path d="M74 77.4983H169V53.5H74.0239C74.0239 55.952 74 77.724 74 77.4983Z" />
    <path d="M234.825 28.0622L176.776 3.56248C172.96 1.69893 168.798 0.655785 164.557 0.5H79.4433C75.1993 0.656083 71.0346 1.69919 67.2161 3.56248L9.17517 28.0622C6.36719 29.4947 4.01792 31.6903 2.39591 34.3981C0.773907 37.1059 -0.0553747 40.2166 0.00287015 43.3746V141.39C0.00287015 144.452 0.00285085 147.514 3.05764 150.577L21.3943 168.952C24.4491 172.014 26.7422 172.014 30.5587 172.014H72.5482C72.5482 174.647 72.5482 196.737 72.5482 196.498H171.809V171.982H72.6275V147.514H27.5039C24.4491 147.514 24.4491 144.452 24.4491 144.452V28.0622C24.4491 28.0622 24.4491 24.9998 27.5039 24.9998H216.504C219.559 24.9998 219.559 28.0622 219.559 28.0622V144.452C219.559 144.452 219.559 147.514 216.504 147.514H171.833V172.014H213.449C217.266 172.014 219.559 172.014 222.614 168.952L240.942 150.577C243.997 147.514 243.997 144.452 243.997 141.39V43.3746C244.055 40.2168 243.225 37.1065 241.603 34.3988C239.981 31.6912 237.632 29.4954 234.825 28.0622V28.0622Z" />
  </>
);
