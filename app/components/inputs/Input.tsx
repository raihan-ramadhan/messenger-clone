import cn from "clsx";
import { ComponentPropsWithRef, forwardRef } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps extends ComponentPropsWithRef<"input"> {
  id: string;
  label: string;
  errors: FieldErrors;
  register: UseFormRegister<FieldValues>;
}

// eslint-disable-next-line react/display-name
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, errors, register, disabled, required, ...rest }) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
        <div className="mt-2">
          <input
            id={id}
            autoComplete={id}
            disabled={disabled}
            className={cn(
              "form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6",
              errors[id] && "focus:ring-rose-500",
              disabled && "opacity-50 cursor-default"
            )}
            {...rest}
            {...register(id, { required })}
          />
        </div>
      </div>
    );
  }
);

export default Input;
