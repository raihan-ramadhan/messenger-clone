"use client";

import cn from "clsx";
import { ComponentPropsWithRef, forwardRef } from "react";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  children?: React.ReactNode;
  fullWidth?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
};

// eslint-disable-next-line react/display-name
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { disabled, className, children, fullWidth, secondary, danger, ...rest },
    ref
  ) => {
    return (
      <button
        disabled={disabled}
        // prettier-ignore
        className={cn(
          "flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          disabled && "opacity-50 cursor-default",
          fullWidth && "w-full",
          secondary ? "text-gray-900" : "text-white",
          danger && "bg-rose-500 ",
          danger &&
            !disabled &&
            "hover:bg-rose-600 focus-visible:outline-rose-600",
          !secondary && !danger && "bg-sky-500",
          !secondary && !danger && !disabled && "hover:bg-sky-600 focus-visible:outline-sky-600",
          className
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export default Button;
