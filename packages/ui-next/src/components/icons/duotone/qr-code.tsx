import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const QRCodeDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M0.982993 12.4995H2.88819C3.44163 12.4995 3.8714 12.0021 3.8714 11.4388L3.8726 5.23889C3.8726 4.64182 4.30237 4.17816 4.85581 4.17816H10.5728C11.1262 4.17816 11.556 3.68082 11.556 3.11743V1.06073C11.556 0.463655 11.095 0 10.5728 0H4.88593C2.18238 0 0 2.35461 0 5.23899V11.4067C0 12.0025 0.460778 12.4995 0.982993 12.4995Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M28.9883 18.3335H27.0881C26.5361 18.3335 26.1074 18.799 26.1074 19.3262V25.0983C26.1074 25.6571 25.6788 26.091 25.1268 26.091H19.4247C18.8727 26.091 18.444 26.5565 18.444 27.0837V29.0073C18.444 29.5661 18.9038 30 19.4247 30H25.1268C27.7933 30 30 27.7964 30 25.0669V19.3581C29.9689 18.7993 29.5092 18.3335 28.9883 18.3335Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M25.1129 6.65026e-05H19.4268C18.8733 6.65026e-05 18.4435 0.498753 18.4435 1.06367V3.12464C18.4435 3.72333 18.9046 4.18824 19.4268 4.18824H25.1443C25.6977 4.18824 26.1275 4.65315 26.1275 5.25184V11.4362C26.1275 12.0349 26.5886 12.4998 27.1108 12.4998H29.0162C29.5697 12.4998 29.9995 12.0011 29.9995 11.4362V5.25317C29.9995 2.36105 27.8165 6.65026e-05 25.1129 6.65026e-05Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M10.5442 26.0697H4.87335C4.32135 26.0697 3.8927 25.6369 3.8927 25.0796V19.3242C3.8927 18.767 3.4329 18.3342 2.91205 18.3342L0.980654 18.333C0.428653 18.333 0 18.7972 0 19.323V25.0797C0 27.7717 2.17686 29.9995 4.87323 29.9995H10.5753C11.1273 29.9995 11.556 29.5353 11.556 29.0095V27.091C11.556 26.5036 11.0962 26.0697 10.5442 26.0697Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M13 13L17.0003 12.9999V16.9999H13.0003L13 13Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M16.9997 9H20.9997V13L17.0003 12.9999L16.9997 9Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M17.0003 16.9999L20.9997 17.0001V21.0001H16.9997L17.0003 16.9999Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M9 17.0001L13.0003 16.9999L13 21.0001H9V17.0001Z"
        />
      </svg>
    ),
  ),
);

QRCodeDuoIcon.displayName = "QRCodeDuoIcon";
