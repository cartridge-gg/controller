import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const LayerDetailsDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="accentColor fill-tertiary"
          d="M14.184 6.29163C14.7014 6.05204 15.2986 6.05204 15.8159 6.29163L23.4062 9.79857C23.7014 9.93399 23.8889 10.2291 23.8889 10.5555C23.8889 10.8819 23.7014 11.177 23.4062 11.3125L15.8159 14.8194C15.2986 15.059 14.7014 15.059 14.184 14.8194L6.59372 11.3125C6.29858 11.1736 6.11108 10.8784 6.11108 10.5555C6.11108 10.2326 6.29858 9.93399 6.59372 9.79857L14.184 6.29163Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M21.559 17.8334L23.4062 18.6875C23.7014 18.8229 23.8889 19.1181 23.8889 19.4445C23.8889 19.7709 23.7014 20.066 23.4062 20.2014L15.8159 23.7084C15.2986 23.9479 14.7014 23.9479 14.184 23.7084L6.59372 20.2014C6.29858 20.0625 6.11108 19.7674 6.11108 19.4445C6.11108 19.1216 6.29858 18.8229 6.59372 18.6875L8.44095 17.8334L13.7187 20.2709C14.5312 20.6459 15.4687 20.6459 16.2812 20.2709L21.559 17.8334Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M16.2812 15.8264L21.559 13.3889L23.4062 14.2431C23.7014 14.3785 23.8889 14.6736 23.8889 15C23.8889 15.3264 23.7014 15.6216 23.4062 15.757L15.8159 19.2639C15.2986 19.5035 14.7014 19.5035 14.184 19.2639L6.59372 15.757C6.29858 15.6181 6.11108 15.3229 6.11108 15C6.11108 14.6771 6.29858 14.3785 6.59372 14.2431L8.44095 13.3889L13.7187 15.8264C14.5312 16.2014 15.4687 16.2014 16.2812 15.8264Z"
        />
      </svg>
    ),
  ),
);

LayerDetailsDuoIcon.displayName = "LayerDetailsDuoIcon";
